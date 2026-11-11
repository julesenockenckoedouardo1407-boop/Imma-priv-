import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";

const firebaseConfig={apiKey:"VOTRE_API_KEY",authDomain:"VOTRE_PROJET.firebaseapp.com",projectId:"VOTRE_PROJECT_ID",appId:"VOTRE_APP_ID"};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),functions=getFunctions(app);
const $=id=>document.getElementById(id);let unsub=[];let currentUser=null;
const say=(id,msg)=>$(id).textContent=msg;
const call=name=>httpsCallable(functions,name);
$("register").onclick=async()=>{try{
 if(!$("age").checked)throw Error("La confirmation 18+ est obligatoire.");
 const pseudo=$("pseudo").value.trim();if(!pseudo)throw Error("Saisissez un pseudonyme.");
 const cred=await createUserWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);
 await setDoc(doc(db,"users",cred.user.uid),{uid:cred.user.uid,email:cred.user.email,pseudo,ageConfirmed:true,status:"pending",createdAt:serverTimestamp()});
 say("authMsg","Compte créé. Attendez l'approbation de l'administration.");await loadAccount(cred.user);
 }catch(e){say("authMsg",e.message)}};
$("login").onclick=async()=>{try{await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value)}catch(e){say("authMsg",e.message)}};
$("logout").onclick=()=>signOut(auth);
onAuthStateChanged(auth,user=>{unsub.forEach(f=>f());unsub=[];currentUser=user;if(!user){$("authPanel").classList.remove("hidden");$("appPanel").classList.add("hidden");return}loadAccount(user)});
async function loadAccount(user){$("authPanel").classList.add("hidden");$("appPanel").classList.remove("hidden");
 try{let snap;for(let i=0;i<5;i++){snap=await getDoc(doc(db,"users",user.uid));if(snap.exists())break;await new Promise(r=>setTimeout(r,350))}
 if(!snap.exists())throw Error("Profil introuvable. Déconnectez-vous puis reconnectez-vous.");
 const me=snap.data();$("myName").textContent=me.pseudo||user.email;
 if(me.status!=="approved"||me.ageConfirmed!==true){say("approval","Votre compte est en attente d'approbation. Les deux comptes doivent être approuvés.");$("coupleArea").classList.add("hidden");return}
 say("approval","Compte approuvé.");$("coupleArea").classList.remove("hidden");
 if(me.coupleId){const link=await getDoc(doc(db,"coupleLinks",me.coupleId));if(link.exists()){const data=link.data();$("requestUnlink").classList.toggle("hidden",!!data.unlinkRequestedBy);say("coupleState","Vous êtes liés : "+(data.memberNames||[]).join(" & ")+".");$("inviteForm").classList.add("hidden");if(data.unlinkRequestedBy){$("unlinkBox").classList.remove("hidden");$("confirmUnlink").classList.toggle("hidden",data.unlinkRequestedBy===user.uid);$("cancelUnlink").classList.toggle("hidden",data.unlinkRequestedBy!==user.uid)}else $("unlinkBox").classList.add("hidden")}else{say("coupleState","Aucun partenaire lié.");$("requestUnlink").classList.add("hidden");$("inviteForm").classList.remove("hidden")}}
 else{say("coupleState","Aucun partenaire lié pour le moment.");$("requestUnlink").classList.add("hidden");$("inviteForm").classList.remove("hidden");$("unlinkBox").classList.add("hidden")}
 unsub.forEach(f=>f());unsub=[];
 const rq=query(collection(db,"coupleInvitations"),where("toUid","==",user.uid),where("status","==","pending"));
 const sq=query(collection(db,"coupleInvitations"),where("fromUid","==",user.uid),where("status","==","pending"));
 unsub.push(onSnapshot(rq,s=>renderInvites("received",s.docs,true)));
 unsub.push(onSnapshot(sq,s=>renderInvites("sent",s.docs,false)));
 }catch(e){say("approval",e.message)}}
function renderInvites(id,docs,incoming){const box=$(id);box.innerHTML="";if(!docs.length){box.textContent="Aucune invitation en attente.";return}
 docs.forEach(d=>{const x=d.data(),div=document.createElement("div");div.className="invite";const title=document.createElement("b");title.textContent=incoming?"Invitation de "+(x.fromPseudo||x.fromEmail):"Invitation envoyée à "+x.toEmail;div.append(title);
 const accept=document.createElement("button"),decline=document.createElement("button");if(incoming){accept.textContent="Accepter";accept.onclick=()=>runAction("acceptCoupleInvite",{inviteId:d.id},"Invitation acceptée.");decline.textContent="Refuser";decline.className="secondary";decline.onclick=()=>runAction("declineCoupleInvite",{inviteId:d.id},"Invitation refusée.");div.append(accept,decline)}else{const cancel=document.createElement("button");cancel.textContent="Annuler l'invitation";cancel.className="secondary";cancel.onclick=()=>runAction("cancelCoupleInvite",{inviteId:d.id},"Invitation annulée.");div.append(cancel)}box.append(div)})}
async function runAction(name,data,success){try{await call(name)(data);say("actionMsg",success);if(currentUser)await loadAccount(currentUser)}catch(e){say("actionMsg",e.message)}}
$("sendInvite").onclick=async()=>{const email=$("partnerEmail").value.trim().toLowerCase();if(!email){say("actionMsg","Saisissez l'adresse e-mail du partenaire.");return}await runAction("sendCoupleInvite",{partnerEmail:email},"Invitation envoyée. Votre partenaire doit l'accepter.")};
$("confirmUnlink").onclick=()=>runAction("confirmCoupleUnlink",{},"La liaison a été rompue.");
$("cancelUnlink").onclick=()=>runAction("cancelCoupleUnlink",{},"Votre demande de rupture a été annulée.");
$("requestUnlink").onclick=()=>runAction("requestCoupleUnlink",{},"Demande envoyée. Votre partenaire doit la confirmer.");
