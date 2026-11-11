const {onCall,HttpsError}=require("firebase-functions/v2/https");
const {initializeApp}=require("firebase-admin/app");
const {getAuth}=require("firebase-admin/auth");
const {getFirestore,FieldValue}=require("firebase-admin/firestore");
initializeApp();
const db=getFirestore();
async function approved(uid){
 const s=await db.doc(`users/${uid}`).get();
 if(!s.exists) throw new HttpsError("failed-precondition","Profil introuvable.");
 const u=s.data();
 if(u.status!=="approved"||u.ageConfirmed!==true) throw new HttpsError("permission-denied","Les deux comptes doivent être approuvés et avoir confirmé leur majorité.");
 return u;
}
exports.sendCoupleInvite=onCall(async request=>{
 if(!request.auth) throw new HttpsError("unauthenticated","Connectez-vous.");
 const uid=request.auth.uid, me=await approved(uid);
 if(me.coupleId) throw new HttpsError("failed-precondition","Votre compte est déjà lié à un partenaire.");
 const email=String(request.data?.partnerEmail||"").trim().toLowerCase();
 if(!email||email===String(request.auth.token.email||"").toLowerCase()) throw new HttpsError("invalid-argument","Adresse partenaire invalide.");
 let target;try{target=await getAuth().getUserByEmail(email)}catch(e){throw new HttpsError("not-found","Aucun compte ne correspond à cette adresse e-mail.")}
 if(target.uid===uid) throw new HttpsError("invalid-argument","Vous ne pouvez pas vous inviter vous-même.");
 const partner=await approved(target.uid);
 if(partner.coupleId) throw new HttpsError("failed-precondition","Ce compte est déjà lié à un partenaire.");
 const existing=await db.collection("coupleInvitations").where("fromUid","==",uid).where("toUid","==",target.uid).where("status","==","pending").limit(1).get();
 if(!existing.empty) throw new HttpsError("already-exists","Une invitation est déjà en attente.");
 const reverse=await db.collection("coupleInvitations").where("fromUid","==",target.uid).where("toUid","==",uid).where("status","==","pending").limit(1).get();
 if(!reverse.empty) throw new HttpsError("already-exists","Cette personne vous a déjà envoyé une invitation. Consultez vos invitations reçues.");
 await db.collection("coupleInvitations").add({fromUid:uid,fromEmail:request.auth.token.email||"",fromPseudo:me.pseudo||"",toUid:target.uid,toEmail:email,status:"pending",createdAt:FieldValue.serverTimestamp()});
 return {ok:true};
});
exports.acceptCoupleInvite=onCall(async request=>{
 if(!request.auth) throw new HttpsError("unauthenticated","Connectez-vous.");
 const uid=request.auth.uid, inviteId=String(request.data?.inviteId||"");
 if(!inviteId) throw new HttpsError("invalid-argument","Invitation manquante.");
 const me=await approved(uid), ref=db.doc(`coupleInvitations/${inviteId}`);
 await db.runTransaction(async tx=>{
  const invSnap=await tx.get(ref);
  if(!invSnap.exists) throw new HttpsError("not-found","Invitation introuvable.");
  const inv=invSnap.data();
  if(inv.toUid!==uid||inv.status!=="pending") throw new HttpsError("permission-denied","Cette invitation ne vous est pas destinée ou n'est plus active.");
  const fromRef=db.doc(`users/${inv.fromUid}`),toRef=db.doc(`users/${uid}`);
  const fromSnap=await tx.get(fromRef),toSnap=await tx.get(toRef);
  if(!fromSnap.exists||!toSnap.exists) throw new HttpsError("failed-precondition","Profil manquant.");
  const a=fromSnap.data(),b=toSnap.data();
  if(a.status!=="approved"||a.ageConfirmed!==true||b.status!=="approved"||b.ageConfirmed!==true) throw new HttpsError("permission-denied","Les deux membres doivent être approuvés et majeurs.");
  if(a.coupleId||b.coupleId) throw new HttpsError("failed-precondition","Un des comptes est déjà lié.");
  const coupleId=inv.fromUid<uid?`${inv.fromUid}_${uid}`:`${uid}_${inv.fromUid}`;
  tx.create(db.doc(`coupleLinks/${coupleId}`),{memberIds:[inv.fromUid,uid],memberNames:[a.pseudo||inv.fromEmail,b.pseudo||request.auth.token.email||""],createdAt:FieldValue.serverTimestamp(),createdBy:uid});
  tx.update(fromRef,{coupleId});tx.update(toRef,{coupleId});
  tx.update(ref,{status:"accepted",acceptedAt:FieldValue.serverTimestamp()});
 });
 return {ok:true};
});