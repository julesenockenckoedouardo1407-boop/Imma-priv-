import{initializeApp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import{getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import{getFirestore,doc,getDoc,setDoc,updateDoc,collection,query,where,getDocs,serverTimestamp,limit}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import{firebaseConfig}from"./firebase-config.js";
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id);
let me=null,myData=null,profiles=[],sentIds=new Set(),currentTab="discover";
const say=(id,t)=>$(id).textContent=t;
$("loginForm").onsubmit=async e=>{e.preventDefault();say("loginMsg","Connexion…");try{await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);}catch(x){say("loginMsg",x.message);}};
$("logout").onclick=()=>signOut(auth);$("pendingLogout").onclick=()=>signOut(auth);
onAuthStateChanged(auth,async u=>{
 me=u;$("loginView").classList.toggle("hidden",!!u);$("logout").classList.toggle("hidden",!u);$("pendingView").classList.add("hidden");$("loveApp").classList.add("hidden");
 if(!u)return;
 try{
  const s=await getDoc(doc(db,"users",u.uid));
  if(!s.exists()||s.data().status!=="approved"||s.data().adultConfirmed!==true){$("pendingView").classList.remove("hidden");return;}
  myData=s.data();$("loveApp").classList.remove("hidden");
  await ensurePublicProfile();await loadProfiles();await loadSent();await loadIncoming();await loadMatches();
 }catch(e){console.error(e);alert("Erreur de chargement. Vérifie les règles Firestore.");}
});
async function ensurePublicProfile(){
 const ref=doc(db,"loveProfiles",me.uid),snap=await getDoc(ref);
 if(!snap.exists()){
  await setDoc(ref,{uid:me.uid,displayName:myData.displayName||me.displayName||"Membre",bio:myData.bio||"",interests:"",seeking:"Je préfère voir",createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
 }
 const p=(await getDoc(ref)).data();
 $("myName").value=p.displayName||"";$("myBio").value=p.bio||"";$("myInterests").value=p.interests||"";$("mySeeking").value=p.seeking||"Je préfère voir";
 $("myAvatar").textContent=(p.displayName||"♥").slice(0,1).toUpperCase();
}
$("saveProfile").onclick=async()=>{
 try{
  const displayName=$("myName").value.trim(),bio=$("myBio").value.trim(),interests=$("myInterests").value.trim(),seeking=$("mySeeking").value;
  if(!displayName)throw Error("Le pseudonyme est obligatoire.");
  await updateDoc(doc(db,"loveProfiles",me.uid),{displayName,bio,interests,seeking,updatedAt:serverTimestamp()});
  $("myAvatar").textContent=displayName.slice(0,1).toUpperCase();say("profileMsg","Profil mis à jour.");
  await loadProfiles();
 }catch(e){say("profileMsg",e.message);}
};
async function loadProfiles(){
 const q=query(collection(db,"loveProfiles"),limit(200)),s=await getDocs(q);
 profiles=s.docs.map(d=>({id:d.id,...d.data()})).filter(p=>p.uid!==me.uid);
 renderProfiles();
}
async function loadSent(){
 const s=await getDocs(query(collection(db,"loveLikes"),where("from","==",me.uid)));
 sentIds=new Set(s.docs.map(d=>d.data().to));
}
function makeCard(p,actionType="discover"){
 const card=document.createElement("article");card.className="panel member-card";
 const top=document.createElement("div");top.className="card-top";
 const av=document.createElement("div");av.className="avatar";av.textContent=(p.displayName||"M").slice(0,1).toUpperCase();
 const title=document.createElement("div");const name=document.createElement("div");name.className="member-name";name.textContent=p.displayName||"Membre";
 const chip=document.createElement("span");chip.className="chip";chip.textContent=p.seeking||"Faire connaissance";title.append(name,chip);top.append(av,title);
 const bio=document.createElement("p");bio.className="bio";bio.textContent=p.bio||"Ce membre n'a pas encore ajouté de présentation.";
 const interests=document.createElement("div");interests.className="interests";interests.textContent=p.interests?"Centres d'intérêt : "+p.interests:"";
 card.append(top,bio,interests);
 if(actionType==="discover"){
  const actions=document.createElement("div");actions.className="card-actions";
  const btn=document.createElement("button");btn.className="btn interest-btn"+(sentIds.has(p.uid)?" sent":"");btn.textContent=sentIds.has(p.uid)?"Intérêt envoyé":"Exprimer mon intérêt";btn.disabled=sentIds.has(p.uid);
  btn.onclick=()=>sendInterest(p,btn);actions.append(btn);card.append(actions);
 }
 return card;
}
function renderProfiles(){
 const box=$("profiles");box.innerHTML="";
 if(!profiles.length){box.innerHTML='<div class="empty">Pas encore de profils disponibles. Reviens un peu plus tard.</div>';return;}
 profiles.forEach(p=>box.append(makeCard(p)));
}
async function sendInterest(p,btn){
 try{
  const id=me.uid+"_"+p.uid,ref=doc(db,"loveLikes",id);
  await setDoc(ref,{from:me.uid,to:p.uid,createdAt:serverTimestamp()});
  sentIds.add(p.uid);btn.textContent="Intérêt envoyé";btn.classList.add("sent");btn.disabled=true;
  await loadIncoming();await loadMatches();
 }catch(e){alert("Impossible d'envoyer cet intérêt : "+e.message);}
}
async function loadIncoming(){
 const box=$("incoming");box.innerHTML="";
 const s=await getDocs(query(collection(db,"loveLikes"),where("to","==",me.uid)));
 if(s.empty){box.innerHTML='<div class="empty">Aucun nouvel intérêt pour le moment.</div>';return;}
 const ids=s.docs.map(d=>d.data().from);
 const matches=await getDocs(query(collection(db,"loveMatches"),where("members","array-contains",me.uid)));
 const matched=new Set(matches.docs.map(d=>d.data().members.find(x=>x!==me.uid)));
 for(const uid of ids){if(matched.has(uid))continue;const p=await getDoc(doc(db,"loveProfiles",uid));if(p.exists())box.append(makeCard(p.data(),"incoming"));}
 if(!box.children.length)box.innerHTML='<div class="empty">Aucun nouvel intérêt en attente.</div>';
}
async function loadMatches(){
 const box=$("matches");box.innerHTML="";
 const s=await getDocs(query(collection(db,"loveMatches"),where("members","array-contains",me.uid)));
 if(s.empty){box.innerHTML='<div class="empty">Les affinités apparaîtront ici lorsque l'intérêt sera réciproque.</div>';return;}
 for(const d of s.docs){const uid=d.data().members.find(x=>x!==me.uid);if(!uid)continue;const p=await getDoc(doc(db,"loveProfiles",uid));if(p.exists())box.append(makeCard(p.data(),"match"));}
}
function showTab(tab){
 currentTab=tab;
 ["discover","likes","matches"].forEach(t=>{$(t+"Panel").classList.toggle("hidden",t!==tab);$(t+"Tab").classList.toggle("active",t===tab);});
}
$("discoverTab").onclick=()=>showTab("discover");$("likesTab").onclick=()=>showTab("likes");$("matchesTab").onclick=()=>showTab("matches");
$("refresh").onclick=async()=>{await loadProfiles();await loadSent();renderProfiles();};
