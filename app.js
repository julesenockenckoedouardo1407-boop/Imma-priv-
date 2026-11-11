import{initializeApp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import{getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import{getFirestore,doc,getDoc,collection,addDoc,query,where,orderBy,getDocs,deleteDoc,serverTimestamp,limit}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import{firebaseConfig}from"./firebase-config.js";
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id);
let me=null;
const msg=(id,t)=>$(id).textContent=t;
$("loginForm").onsubmit=async e=>{e.preventDefault();msg("loginMsg","Connexion…");try{await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);}catch(x){msg("loginMsg",x.message);}};
$("logout").onclick=()=>signOut(auth);$("pendingLogout").onclick=()=>signOut(auth);
onAuthStateChanged(auth,async user=>{
 me=user;$("loginView").classList.toggle("hidden",!!user);$("logout").classList.toggle("hidden",!user);$("pendingView").classList.add("hidden");$("fantasyApp").classList.add("hidden");
 if(!user)return;
 try{const s=await getDoc(doc(db,"users",user.uid));if(!s.exists()||s.data().status!=="approved"||s.data().adultConfirmed!==true){$("pendingView").classList.remove("hidden");return;}
 $("fantasyApp").classList.remove("hidden");await loadNotes();
 }catch(e){console.error(e);alert("Impossible de vérifier ton accès. Vérifie Firebase.");}
});
$("noteForm").onsubmit=async e=>{
 e.preventDefault();const title=$("noteTitle").value.trim(),body=$("noteBody").value.trim(),category=$("noteCategory").value;
 if(!title||!body)return msg("saveMsg","Ajoute un titre et un texte.");
 try{await addDoc(collection(db,"fantasyNotes"),{ownerId:me.uid,title,body,category,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});$("noteForm").reset();msg("saveMsg","Ta note privée a été enregistrée.");await loadNotes();}
 catch(e){msg("saveMsg","Erreur : "+e.message);}
};
$("reload").onclick=loadNotes;$("searchNotes").oninput=loadNotes;
async function loadNotes(){
 const box=$("notesList");box.innerHTML='<p class="muted tiny">Chargement…</p>';
 try{
  const q=query(collection(db,"fantasyNotes"),where("ownerId","==",me.uid),orderBy("createdAt","desc"),limit(100)),s=await getDocs(q);
  const term=$("searchNotes").value.trim().toLowerCase();box.innerHTML="";
  const notes=s.docs.map(d=>({id:d.id,...d.data()})).filter(n=>(n.title+" "+n.body+" "+n.category).toLowerCase().includes(term));
  if(!notes.length){box.innerHTML='<div class="note-card"><p class="muted tiny">Ton carnet est vide. Tu peux commencer par écrire une première note.</p></div>';return;}
  notes.forEach(n=>{
   const card=document.createElement("article");card.className="note-card";
   const top=document.createElement("div");top.className="note-top";
   const title=document.createElement("div");title.className="note-title";title.textContent=n.title;
   const date=document.createElement("span");date.className="note-date";date.textContent=n.createdAt?.toDate?n.createdAt.toDate().toLocaleDateString("fr-FR"):"Récemment";
   top.append(title,date);
   const cat=document.createElement("span");cat.className="category";cat.textContent=n.category||"Note";
   const body=document.createElement("p");body.className="note-body";body.textContent=n.body;
   const actions=document.createElement("div");actions.className="note-actions";
   const del=document.createElement("button");del.className="delete";del.textContent="Supprimer cette note";
   del.onclick=async()=>{if(!confirm("Supprimer définitivement cette note ?"))return;try{await deleteDoc(doc(db,"fantasyNotes",n.id));await loadNotes();}catch(e){alert(e.message);}};
   actions.append(del);card.append(top,cat,body,actions);box.append(card);
  });
 }catch(e){console.error(e);box.innerHTML='<p class="message">Impossible de charger les notes. Vérifie les règles Firestore et les index nécessaires.</p>';}
}
const modal=$("aboutModal");$("aboutBtn").onclick=()=>modal.classList.remove("hidden");$("closeAbout").onclick=()=>modal.classList.add("hidden");$("closeAbout2").onclick=()=>modal.classList.add("hidden");modal.onclick=e=>{if(e.target===modal)modal.classList.add("hidden");};
