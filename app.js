import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc,
  query, orderBy, limit, getDocs, serverTimestamp, where, runTransaction
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const $ = id => document.getElementById(id);
let mode = "login";
let currentUser = null;
let memberApproved = false;

function message(id, text, error=false) {
  const el=$(id); el.textContent=text; el.style.color=error?"#ff9da9":"#d8b276";
}
function setMode(next) {
  mode=next;
  $("loginTab").classList.toggle("active",mode==="login");
  $("registerTab").classList.toggle("active",mode==="register");
  $("nameLabel").classList.toggle("hidden",mode!=="register");
  $("ageLabel").classList.toggle("hidden",mode!=="register");
  $("authSubmit").textContent=mode==="login"?"Se connecter":"Créer mon compte";
  $("password").autocomplete=mode==="login"?"current-password":"new-password";
  message("authMessage","");
}
$("loginTab").onclick=()=>setMode("login");
$("registerTab").onclick=()=>setMode("register");

$("authForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const email=$("email").value.trim(), password=$("password").value;
  try {
    message("authMessage","Traitement en cours…");
    if(mode==="register"){
      const name=$("displayName").value.trim();
      if(!name) throw new Error("Choisis un pseudonyme.");
      if(!$("adultCheck").checked) throw new Error("Tu dois confirmer avoir au moins 18 ans.");
      const cred=await createUserWithEmailAndPassword(auth,email,password);
      await updateProfile(cred.user,{displayName:name});
      await setDoc(doc(db,"users",cred.user.uid),{
        email, displayName:name, bio:"", adultConfirmed:true,
        status:"pending", createdAt:serverTimestamp()
      });
      message("authMessage","Compte créé. Ton accès sera activé après validation.");
    } else {
      await signInWithEmailAndPassword(auth,email,password);
    }
  } catch(err){ message("authMessage",friendlyError(err),true); }
});

function friendlyError(err){
  const map={"auth/email-already-in-use":"Cette adresse e-mail possède déjà un compte.",
  "auth/invalid-email":"Adresse e-mail invalide.","auth/weak-password":"Mot de passe trop faible.",
  "auth/invalid-credential":"Adresse e-mail ou mot de passe incorrect.",
  "auth/network-request-failed":"Problème de connexion. Réessaie."};
  return map[err.code]||err.message||"Une erreur est survenue.";
}

onAuthStateChanged(auth,async user=>{
  currentUser=user;
  $("authView").classList.toggle("hidden",!!user);
  $("appView").classList.toggle("hidden",!user);
  $("logoutBtn").classList.toggle("hidden",!user);
  if(!user) return;
  try{
    const snap=await getDoc(doc(db,"users",user.uid));
    if(!snap.exists()){await signOut(auth);return;}
    const data=snap.data();
    $("welcomeName").textContent=data.displayName||user.displayName||"Membre";
    $("profileName").value=data.displayName||"";
    $("profileBio").value=data.bio||"";
    memberApproved=data.status==="approved";
    $("memberStatus").textContent=memberApproved?"Membre validé":"Compte en attente";
    $("pendingNotice").classList.toggle("hidden",memberApproved);
    $("memberArea").classList.toggle("hidden",!memberApproved);
    if(memberApproved) await loadFeed();
  }catch(err){console.error(err);alert("Impossible de charger ton profil. Vérifie les règles Firestore.");}
});

$("logoutBtn").onclick=()=>signOut(auth);
$("saveProfile").onclick=async()=>{
  if(!currentUser)return;
  try{
    const displayName=$("profileName").value.trim(), bio=$("profileBio").value.trim();
    if(!displayName) throw new Error("Le pseudonyme est obligatoire.");
    await updateDoc(doc(db,"users",currentUser.uid),{displayName,bio});
    await updateProfile(currentUser,{displayName});
    $("welcomeName").textContent=displayName;
    message("profileMessage","Profil enregistré.");
  }catch(err){message("profileMessage",friendlyError(err),true);}
};

$("postForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const text=$("postText").value.trim();
  if(!text)return message("postMessage","Écris un message avant de publier.",true);
  try{
    await addDoc(collection(db,"posts"),{
      authorId:currentUser.uid,
      authorName:$("profileName").value.trim()||currentUser.displayName||"Membre",
      text, createdAt:serverTimestamp()
    });
    $("postText").value="";
    message("postMessage","Publication envoyée.");
    await loadFeed();
  }catch(err){message("postMessage",friendlyError(err),true);}
});
$("refreshFeed").onclick=loadFeed;

async function loadFeed(){
  const feed=$("feed"); feed.innerHTML='<p class="small">Chargement du fil…</p>';
  try{
    const q=query(collection(db,"posts"),orderBy("createdAt","desc"),limit(40));
    const snap=await getDocs(q);
    feed.innerHTML="";
    if(snap.empty){feed.innerHTML='<div class="panel post"><p class="small">Aucune publication pour le moment. Sois le premier à partager quelque chose.</p></div>';return;}
    for(const postDoc of snap.docs) await renderPost(postDoc);
  }catch(err){feed.innerHTML='<p class="message">Impossible de charger les publications. Vérifie les règles Firestore.</p>';console.error(err);}
}
async function renderPost(postDoc){
  const p=postDoc.data(), id=postDoc.id;
  const likeRef=doc(db,"posts",id,"likes",currentUser.uid);
  const liked=(await getDoc(likeRef)).exists();
  const commentsSnap=await getDocs(query(collection(db,"posts",id,"comments"),orderBy("createdAt","asc"),limit(30)));
  const card=document.createElement("article");card.className="panel post";
  const head=document.createElement("div");head.className="post-head";
  const author=document.createElement("span");author.className="post-author";author.textContent=p.authorName||"Membre";
  const date=document.createElement("span");date.className="post-date";date.textContent=p.createdAt?.toDate?p.createdAt.toDate().toLocaleString("fr-FR"):"À l'instant";
  head.append(author,date);
  const body=document.createElement("p");body.className="post-text";body.textContent=p.text||"";
  const actions=document.createElement("div");actions.className="post-actions";
  const like=document.createElement("button");like.className="like-btn"+(liked?" liked":"");like.textContent=(liked?"♥ J'aime":"♡ J'aime");
  const commentToggle=document.createElement("button");commentToggle.className="comment-toggle";commentToggle.textContent=`Commentaires (${commentsSnap.size})`;
  actions.append(like,commentToggle);
  const comments=document.createElement("div");comments.className="comments hidden";
  commentsSnap.forEach(c=>{
    const row=document.createElement("div");row.className="comment";
    const b=document.createElement("b");b.textContent=(c.data().authorName||"Membre")+" :";
    row.append(b,document.createTextNode(c.data().text||""));comments.append(row);
  });
  const form=document.createElement("form");form.className="comment-form";
  const input=document.createElement("input");input.placeholder="Écrire un commentaire…";input.maxLength=300;input.required=true;
  const send=document.createElement("button");send.className="btn secondary";send.textContent="Envoyer";
  form.append(input,send);comments.append(form);
  like.onclick=()=>toggleLike(id,like);
  commentToggle.onclick=()=>comments.classList.toggle("hidden");
  form.onsubmit=async e=>{
    e.preventDefault();const text=input.value.trim();if(!text)return;
    try{
      await addDoc(collection(db,"posts",id,"comments"),{
        authorId:currentUser.uid,authorName:$("profileName").value.trim()||currentUser.displayName||"Membre",
        text,createdAt:serverTimestamp()
      });await loadFeed();
    }catch(err){alert(friendlyError(err));}
  };
  card.append(head,body,actions,comments);$("feed").append(card);
}
async function toggleLike(postId,button){
  try{
    const ref=doc(db,"posts",postId,"likes",currentUser.uid);
    await runTransaction(db,async tx=>{
      const snap=await tx.get(ref);
      if(snap.exists())tx.delete(ref);
      else tx.set(ref,{userId:currentUser.uid,createdAt:serverTimestamp()});
    });
    button.classList.toggle("liked");
    button.textContent=button.classList.contains("liked")?"♥ J'aime":"♡ J'aime";
  }catch(err){alert(friendlyError(err));}
}
