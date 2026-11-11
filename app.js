import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);
const panel = $("auth-panel");
const form = $("auth-form");
const notice = $("form-notice");
let mode = "register";
let firebaseReady = Object.values(firebaseConfig).every(v => v && !String(v).includes("REMPLACER"));

let auth = null, db = null;
if (firebaseReady) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.warn("Configurez firebase-config.js pour activer les comptes réels.");
}

function message(text, error = false) {
  notice.textContent = text;
  notice.className = error ? "notice error" : "notice";
}
function setMode(next) {
  mode = next;
  const registering = mode === "register";
  $("form-title").textContent = registering ? "Créer un compte" : "Heureux de vous revoir";
  $("form-subtitle").textContent = registering ? "Rejoignez la communauté en quelques étapes." : "Connectez-vous à votre espace membre.";
  $("submit-auth").textContent = registering ? "Créer mon compte" : "Se connecter";
  ["name-wrap","confirm-wrap","age-wrap","rules-wrap"].forEach(id => $(id).classList.toggle("hidden", !registering));
  $("username").required = registering;
  $("confirm-password").required = registering;
  $("age-check").required = registering;
  $("rules-check").required = registering;
  $("form-switch").innerHTML = registering
    ? 'Déjà membre ? <button type="button" id="switch-mode">Se connecter</button>'
    : 'Pas encore membre ? <button type="button" id="switch-mode">Créer un compte</button>';
  $("switch-mode").addEventListener("click", () => setMode(registering ? "login" : "register"));
  message("");
}
function openPanel(next) {
  panel.classList.remove("hidden");
  setMode(next);
}
$("go-register").addEventListener("click", () => openPanel("register"));
$("go-login").addEventListener("click", () => openPanel("login"));
$("close-panel").addEventListener("click", () => panel.classList.add("hidden"));
$("logout").addEventListener("click", async () => { if (auth) await signOut(auth); });

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!firebaseReady) {
    message("Firebase n'est pas encore configuré. Complétez firebase-config.js puis rechargez l'application.", true);
    return;
  }
  const email = $("email").value.trim();
  const password = $("password").value;
  try {
    if (mode === "register") {
      if (password !== $("confirm-password").value) throw new Error("Les mots de passe ne correspondent pas.");
      if (!$("age-check").checked) throw new Error("Vous devez confirmer avoir 18 ans ou plus.");
      if (!$("rules-check").checked) throw new Error("Veuillez accepter les règles de la communauté.");
      const username = $("username").value.trim();
      if (username.length < 3) throw new Error("Le nom d'utilisateur doit contenir au moins 3 caractères.");
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", credential.user.uid), {
        username, email, status: "pending", role: "member",
        adultConfirmed: true, rulesAccepted: true,
        createdAt: serverTimestamp()
      });
      message("Compte créé. Votre demande est en attente de validation par l'administrateur. Vous serez connecté lorsque votre compte sera approuvé.");
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      panel.classList.add("hidden");
    }
  } catch (error) {
    const known = {
      "auth/email-already-in-use": "Cette adresse e-mail possède déjà un compte.",
      "auth/invalid-email": "Adresse e-mail invalide.",
      "auth/weak-password": "Choisissez un mot de passe plus robuste.",
      "auth/invalid-credential": "Adresse e-mail ou mot de passe incorrect.",
      "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard."
    };
    message(known[error.code] || error.message || "Une erreur est survenue.", true);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user || !db) {
    $("member-area").classList.add("hidden");
    $("welcome").classList.remove("hidden");
    return;
  }
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) {
      $("member-area").classList.remove("hidden");
      $("member-title").textContent = "Profil introuvable";
      $("member-content").textContent = "Contactez l'administrateur pour obtenir de l'aide.";
      return;
    }
    const profile = snap.data();
    $("welcome").classList.add("hidden");
    $("member-area").classList.remove("hidden");
    $("member-title").textContent = `Bienvenue, ${profile.username}`;
    const approved = profile.status === "approved";
    $("member-content").innerHTML = approved
      ? `<p><strong>Compte validé.</strong> Bienvenue dans IMMA PRIVÉ. Les espaces communautaires seront ajoutés dans les prochaines versions.</p><p>Statut : membre approuvé.</p>`
      : `<p><strong>Votre compte est en attente de validation.</strong></p><p>Vous pourrez accéder à la communauté après approbation par l'administrateur.</p><p>Statut : ${profile.status === "rejected" ? "demande refusée" : "en attente"}.</p>`;
  } catch (error) {
    $("member-area").classList.remove("hidden");
    $("member-title").textContent = "Espace membre";
    $("member-content").textContent = "Impossible de charger votre profil. Vérifiez la configuration et les règles Firestore.";
  }
});

if (!firebaseReady) {
  $("go-register").addEventListener("click", () => {
    if (!panel.classList.contains("hidden")) message("Configuration Firebase nécessaire pour créer des comptes réels.", true);
  });
}
