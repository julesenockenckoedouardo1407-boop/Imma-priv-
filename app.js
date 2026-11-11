import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";

// Remplacez ces valeurs par celles de votre projet Firebase.
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJET.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  appId: "VOTRE_APP_ID"
};
const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app), functions=getFunctions(app);
const $=id=>document.getElementById(id);
let unsub=[];
const say=(id,msg)=>$(id).textContent=msg;
$("register").onclick=async()=>{try{
 if(!$("age").checked) throw Error("La confirmation 18+ est obligatoire.");
 const pseudo=$("pseudo").value.trim(); if(!pseudo) throw Error("Saisissez un pseudonyme.");
 const cred=await createUserWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);
 await setDoc(doc(db,"users",cred.user.uid),{uid:cred.user.uid,email:cred.user.email,pseudo,ageConfirmed:true,status:"pending",createdAt:serverTimestamp()});
 say("authMsg","Compte créé. Il doit être approuvé par l'administration avant toute liaison.");
}catch(e){say("authMsg",e.message)}};
$("login").onclick=async()=>{try{await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);say("authMsg","Connexion réussie.")}catch(e){say("authMsg",e.message)}};
$("logout").onclick=()=>signOut(auth);
onAuthStateChanged(auth,async user=>{
 unsub.forEach(fn=>fn());unsub=[];
 if(!user){$("authPanel").classList.remove("hidden");$("appPanel").classList.add("hidden");return}
 $("authPanel").classList.add("hidden");$("appPanel").classList.remove("hidden");
 try{
  const snap=await getDoc(doc(db,"users",user.uid)); if(!snap.exists()) throw Error("Profil utilisateur introuvable.");
  const me=snap.data();$("myName").textContent=me.pseudo||user.email;
  if(me.status!=="approved"||me.ageConfirmed!==true){say("approval","Votre compte est en attente de validation par l'administration. La liaison couple est désactivée.");$("coupleArea").classList.add("hidden");return}
  say("approval","Compte validé. Vous pouvez envoyer ou accepter une invitation.");
  $("coupleArea").classList.remove("hidden");
  const link=me.coupleId?await getDoc(doc(db,"coupleLinks",me.coupleId)):null;
  if(link?.exists()){const names=link.data().memberNames||[];say("coupleState","Vous êtes liés : "+names.join(" & ")+".");$("sendInvite").disabled=true}
  else {say("coupleState","Aucun partenaire n'est encore lié à votre compte.");$("sendInvite").disabled=false}
  const receivedQ=query(collection(db,"coupleInvitations"),where("toUid","==",user.uid),where("status","==","pending"));
  const sentQ=query(collection(db,"coupleInvitations"),where("fromUid","==",user.uid));
  unsub.push(onSnapshot(receivedQ,s=>renderInvites("received",s.docs,true)));
  unsub.push(onSnapshot(sentQ,s=>renderInvites("sent",s.docs,false)));
 }catch(e){say("approval",e.message)}
});
function renderInvites(id,docs,incoming){const box=$(id);box.innerHTML="";if(!docs.length){box.textContent="Aucune invitation.";return}
 docs.forEach(d=>{const x=d.data(),div=document.createElement("div");div.className="invite";const title=document.createElement("b");title.textContent=incoming?"Invitation de "+x.fromEmail:"Invitation envoyée à "+x.toEmail;const status=document.createElement("small");status.textContent="État : "+x.status;div.append(title,status);
 if(incoming){const b=document.createElement("button");b.textContent="Accepter";b.onclick=async()=>{b.disabled=true;try{await httpsCallable(functions,"acceptCoupleInvite")({inviteId:d.id});say("inviteMsg","Invitation acceptée. Votre espace commun est créé.")}catch(e){say("inviteMsg",e.message);b.disabled=false}};div.append(b)}
 box.append(div)});
}
$("sendInvite").onclick=async()=>{try{const email=$("partnerEmail").value.trim().toLowerCase();if(!email)throw Error("Saisissez l'adresse e-mail du partenaire.");await httpsCallable(functions,"sendCoupleInvite")({partnerEmail:email});say("inviteMsg","Invitation envoyée. Votre partenaire doit se connecter et l'accepter.")}catch(e){say("inviteMsg",e.message)}};
