import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,doc,getDoc,collection,query,where,orderBy,onSnapshot,addDoc,serverTimestamp,getDocs,limit} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const $=id=>document.getElementById(id);
let me=null,profile=null,selected=null,unsubscribeMessages=null,unsubscribeContacts=null,allUsers=[];
const errText=e=>({"auth/invalid-credential":"E-mail ou mot de passe incorrect.","auth/network-request-failed":"Problème de connexion."}[e.code]||e.message||"Erreur inconnue.");

$("loginForm").onsubmit=async e=>{
 e.preventDefault();$("authMessage").textContent="Connexion…";
 try{await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);}
 catch(err){$("authMessage").textContent=errText(err);}
};
$("logout").onclick=()=>signOut(auth);$("pendingLogout").onclick=()=>signOut(auth);
onAuthStateChanged(auth,async user=>{
 me=user;
 $("authView").classList.toggle("hidden",!!user);
 $("logout").classList.toggle("hidden",!user);
 $("pendingView").classList.add("hidden");$("chatApp").classList.add("hidden");
 if(unsubscribeContacts){unsubscribeContacts();unsubscribeContacts=null;}
 stopMessages();
 if(!user)return;
 try{
   const snap=await getDoc(doc(db,"users",user.uid));
   if(!snap.exists()||snap.data().status!=="approved"||snap.data().adultConfirmed!==true){
     $("pendingView").classList.remove("hidden");return;
   }
   profile=snap.data();$("chatApp").classList.remove("hidden");
   listenContacts();
 }catch(e){alert("Impossible de vérifier ton compte. Vérifie Firebase et les règles Firestore.");console.error(e);}
});

function listenContacts(){
 const q=query(collection(db,"users"),where("status","==","approved"),limit(200));
 unsubscribeContacts=onSnapshot(q,snap=>{
   allUsers=snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.id!==me.uid);
   renderContacts($("searchUsers").value);
 },e=>{console.error(e);$("contactList").innerHTML='<p class="muted tiny">Erreur de chargement. Vérifie les règles Firestore.</p>';});
}
$("searchUsers").oninput=()=>renderContacts($("searchUsers").value);
function renderContacts(filter=""){
 const box=$("contactList");box.innerHTML="";
 const term=filter.trim().toLowerCase();
 const list=allUsers.filter(u=>(u.displayName||"Membre").toLowerCase().includes(term));
 if(!list.length){box.innerHTML='<p class="muted tiny">Aucun membre trouvé.</p>';return;}
 list.sort((a,b)=>(a.displayName||"").localeCompare(b.displayName||""));
 list.forEach(u=>{
   const b=document.createElement("button");b.className="contact"+(selected?.id===u.id?" selected":"");
   const av=document.createElement("span");av.className="avatar";av.textContent=(u.displayName||"M").slice(0,1).toUpperCase();
   const info=document.createElement("span");const n=document.createElement("div");n.className="contact-name";n.textContent=u.displayName||"Membre";
   const sub=document.createElement("div");sub.className="contact-sub";sub.textContent="Membre validé";
   info.append(n,sub);b.append(av,info);b.onclick=()=>openConversation(u);box.append(b);
 });
}
function conversationId(a,b){return [a,b].sort().join("_");}
async function openConversation(user){
 selected=user;renderContacts($("searchUsers").value);
 $("emptyChat").classList.add("hidden");$("activeChat").classList.remove("hidden");
 $("chatName").textContent=user.displayName||"Membre";
 $("chatApp").classList.add("chat-open");
 stopMessages();
 const cid=conversationId(me.uid,user.id);
 // Ensure conversation metadata exists. The rules restrict membership to these two accounts.
 const cRef=doc(db,"conversations",cid);
 try{
   const existing=await getDoc(cRef);
   if(!existing.exists()){
     // First message will create the conversation document through the transaction-free bootstrap.
     // Conversation creation is intentionally handled by a callable/server process in a production deployment.
     // For this starter, the first send creates the metadata and message atomically via the rules.
   }
 }catch(e){console.warn(e);}
 const q=query(collection(db,"conversations",cid,"messages"),orderBy("createdAt","asc"),limit(250));
 unsubscribeMessages=onSnapshot(q,snap=>{
   const box=$("messages");box.innerHTML="";
   snap.forEach(d=>{
     const m=d.data(),bubble=document.createElement("div");
     bubble.className="bubble"+(m.senderId===me.uid?" mine":"");
     const text=document.createElement("span");text.textContent=m.text||"";
     const time=document.createElement("time");time.textContent=m.createdAt?.toDate?m.createdAt.toDate().toLocaleString("fr-FR",{hour:"2-digit",minute:"2-digit"}):"";
     bubble.append(text,time);box.append(bubble);
   });
   box.scrollTop=box.scrollHeight;
 },e=>{console.error(e);$("messages").innerHTML='<p class="muted tiny">Impossible de charger cette conversation. Vérifie les règles Firestore.</p>';});
}
function stopMessages(){if(unsubscribeMessages){unsubscribeMessages();unsubscribeMessages=null;}}
$("backContacts").onclick=()=>{$("chatApp").classList.remove("chat-open");};
$("sendForm").onsubmit=async e=>{
 e.preventDefault();if(!selected)return;
 const text=$("messageInput").value.trim();if(!text)return;
 const cid=conversationId(me.uid,selected.id);
 try{
   const cRef=doc(db,"conversations",cid),cSnap=await getDoc(cRef);
   if(!cSnap.exists()){
     // Metadata created by the first participant; rules require exactly these two member IDs.
     const {setDoc}=await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js");
     await setDoc(cRef,{members:[me.uid,selected.id].sort(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
   }
   await addDoc(collection(db,"conversations",cid,"messages"),{
     senderId:me.uid,recipientId:selected.id,text,createdAt:serverTimestamp()
   });
   $("messageInput").value="";
 }catch(err){alert(errText(err)+"\nSi la conversation ne peut pas être créée, vérifie les règles Firestore.");}
};
