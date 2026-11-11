import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = id => document.getElementById(id);
const configured = Object.values(firebaseConfig).every(v => v && !String(v).includes("REMPLACER"));
let auth = null, db = null, isAdmin = false;
if (configured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}
const notice = $("notice");
function say(text, error=false){notice.textContent=text;notice.className=error?"notice error":"notice";}
function setMode(mode){
 const reg=mode==="register";
 $("form-title").textContent=reg?"Créer un compte":"Heureux de vous revoir";
 $("form-subtitle").textContent=reg?"Rejoignez la communauté en quelques étapes.":"Connectez-vous à votre espace membre.";
 $("submit-auth").textContent=reg?"Créer mon compte":"Se connecter";
 ["name-wrap","confirm-wrap","age-wrap","rules-wrap"].forEach(id=>$(id).classList.toggle("hidden",!reg));
 $("username").required=reg;$("confirm-password").required=reg;$("age-check").required=reg;$("rules-check").required=reg;
 $("form-switch").innerHTML=reg?'Déjà membre ? <button type="button" id="switch-mode">Se connecter</button>':'Pas encore membre ? <button type="button" id="switch-mode">Créer un compte</button>';
 $("switch-mode").onclick=()=>setMode(reg?"login":"register");say("");
}
function openAuth(mode){$("auth-panel").classList.remove("hidden");setMode(mode);}
$("go-register").onclick=()=>openAuth("register");$("go-login").onclick=()=>openAuth("login");
$("close-panel").onclick=()=>$("auth-panel").classList.add("hidden");
$("logout").onclick=()=>auth&&signOut(auth);
$("refresh-users").onclick=()=>loadUsers();

$("auth-form").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!auth){say("Configurez d'abord Firebase dans firebase-config.js.",true);return;}
 const email=$("email").value.trim(),password=$("password").value;
 try{
  if($("form-title").textContent==="Créer un compte"){
   if(password!==$("confirm-password").value)throw new Error("Les mots de passe ne correspondent pas.");
   if(!$("age-check").checked)throw new Error("Confirmez que vous avez 18 ans ou plus.");
   if(!$("rules-check").checked)throw new Error("Veuillez accepter les règles.");
   const username=$("username").value.trim();if(username.length<3)throw new Error("Nom d'utilisateur trop court.");
   const cred=await createUserWithEmailAndPassword(auth,email,password);
   await setDoc(doc(db,"users",cred.user.uid),{username,email,status:"pending",role:"member",adultConfirmed:true,rulesAccepted:true,createdAt:serverTimestamp()});
   say("Compte créé. Votre demande attend la validation de l'administrateur.");
  }else{await signInWithEmailAndPassword(auth,email,password);$("auth-panel").classList.add("hidden");}
 }catch(err){
  const errors={"auth/email-already-in-use":"Cette adresse possède déjà un compte.","auth/invalid-email":"Adresse e-mail invalide.","auth/weak-password":"Mot de passe trop faible.","auth/invalid-credential":"Identifiants incorrects.","auth/too-many-requests":"Trop de tentatives. Réessayez plus tard."};
  say(errors[err.code]||err.message||"Erreur lors de l'opération.",true);
 }
});

function safeText(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function loadUsers(){
 if(!isAdmin||!db)return;
 const box=$("users-list");box.innerHTML='<p class="muted">Chargement…</p>';
 try{
  const snap=await getDocs(query(collection(db,"users"),orderBy("createdAt","desc")));
  let counts={pending:0,approved:0,rejected:0};const rows=[];
  snap.forEach(d=>{
   const u=d.data();const status=["pending","approved","rejected"].includes(u.status)?u.status:"pending";counts[status]++;
   rows.push({id:d.id,...u,status});
  });
  $("pending-count").textContent=counts.pending;$("approved-count").textContent=counts.approved;$("rejected-count").textContent=counts.rejected;
  if(!rows.length){box.innerHTML='<div class="empty">Aucun membre inscrit pour le moment.</div>';return;}
  box.innerHTML=rows.map(u=>`<article class="user-card"><div class="user-info"><strong>${safeText(u.username||"Sans nom")}</strong><small>${safeText(u.email)} · ${safeText(u.status)}</small></div><div class="user-actions">${u.status!=="approved"?`<button class="btn btn-primary" data-action="approved" data-id="${safeText(u.id)}">Approuver</button>`:""}${u.status!=="rejected"?`<button class="btn btn-outline" data-action="rejected" data-id="${safeText(u.id)}">Refuser</button>`:""}${u.status!=="pending"?`<button class="btn btn-outline" data-action="pending" data-id="${safeText(u.id)}">Remettre en attente</button>`:""}</div></article>`).join("");
  box.querySelectorAll("button[data-action]").forEach(btn=>btn.addEventListener("click",()=>changeStatus(btn.dataset.id,btn.dataset.action)));
 }catch(err){box.innerHTML='<div class="empty">Impossible de charger les comptes. Vérifiez les règles Firestore et le droit administrateur.</div>';}
}
async function changeStatus(uid,status){
 if(!isAdmin)return;
 try{await updateDoc(doc(db,"users",uid),{status,reviewedAt:serverTimestamp(),reviewedBy:auth.currentUser.uid});await loadUsers();}
 catch(err){alert("Modification refusée. Vérifiez les règles Firestore et le rôle administrateur.");}
}

onAuthStateChanged(auth,async user=>{
 if(!user){
  $("member-area").classList.add("hidden");$("welcome").classList.remove("hidden");$("logout").classList.add("hidden");return;
 }
 $("welcome").classList.add("hidden");$("member-area").classList.remove("hidden");$("logout").classList.remove("hidden");
 try{
  const [profileSnap,token]=await Promise.all([getDoc(doc(db,"users",user.uid)),user.getIdTokenResult(true)]);
  isAdmin=token.claims.admin===true;
  if(!profileSnap.exists()){$("member-title").textContent="Profil introuvable";$("status-card").textContent="Contactez l'assistance.";return;}
  const p=profileSnap.data();$("member-title").textContent=`Bienvenue, ${p.username||"membre"}`;
  $("role-badge").textContent=isAdmin?"ADMINISTRATEUR":"MEMBRE";
  $("status-card").innerHTML=isAdmin?"<strong>Accès administrateur reconnu.</strong> Vous pouvez gérer les demandes d'inscription.":p.status==="approved"?"<strong>Compte validé.</strong> Les espaces communautaires seront disponibles dans les prochaines versions.":p.status==="rejected"?"<strong>Demande refusée.</strong> Contactez l'équipe si vous pensez qu'il s'agit d'une erreur.":"<strong>Validation en attente.</strong> Votre accès à la communauté sera ouvert après approbation.";
  $("admin-panel").classList.toggle("hidden",!isAdmin);
  if(isAdmin)await loadUsers();
 }catch(err){$("status-card").textContent="Erreur de lecture du profil. Vérifiez les règles Firestore."; }
});
if(!configured){$("go-register").addEventListener("click",()=>say("Firebase doit être configuré pour créer de vrais comptes.",true));}
