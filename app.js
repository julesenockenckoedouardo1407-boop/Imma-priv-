const panel = document.getElementById('auth-panel');
const form = document.getElementById('auth-form');
const title = document.getElementById('form-title');
const subtitle = document.getElementById('form-subtitle');
const submit = document.getElementById('submit-auth');
const switchText = document.getElementById('form-switch');
const notice = document.getElementById('form-notice');
let mode = 'register';

function openPanel(nextMode) {
  mode = nextMode;
  panel.classList.remove('hidden');
  notice.textContent = '';
  notice.className = 'notice';
  const registering = mode === 'register';
  title.textContent = registering ? 'Créer un compte' : 'Heureux de vous revoir';
  subtitle.textContent = registering ? 'Rejoignez la communauté en quelques étapes.' : 'Connectez-vous à votre espace membre.';
  submit.textContent = registering ? 'Créer mon compte' : 'Se connecter';
  document.getElementById('name-wrap').classList.toggle('hidden', !registering);
  document.getElementById('confirm-wrap').classList.toggle('hidden', !registering);
  document.getElementById('age-wrap').classList.toggle('hidden', !registering);
  document.getElementById('rules-wrap').classList.toggle('hidden', !registering);
  document.getElementById('username').required = registering;
  document.getElementById('confirm-password').required = registering;
  document.getElementById('age-check').required = registering;
  document.getElementById('rules-check').required = registering;
  switchText.innerHTML = registering
    ? 'Déjà membre ? <button type="button" id="switch-mode">Se connecter</button>'
    : 'Pas encore membre ? <button type="button" id="switch-mode">Créer un compte</button>';
  document.getElementById('switch-mode').addEventListener('click', () => openPanel(registering ? 'login' : 'register'));
}
document.getElementById('go-register').addEventListener('click', () => openPanel('register'));
document.getElementById('go-login').addEventListener('click', () => openPanel('login'));
document.getElementById('close-panel').addEventListener('click', () => panel.classList.add('hidden'));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  notice.className = 'notice';
  if (mode === 'register') {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm-password').value;
    if (password !== confirm) {
      notice.textContent = 'Les deux mots de passe ne correspondent pas.';
      notice.classList.add('error'); return;
    }
    notice.textContent = 'Maquette prête : la création réelle du compte sera activée après la configuration de Firebase. Aucun mot de passe n’est envoyé ni enregistré par cette démonstration.';
  } else {
    notice.textContent = 'La connexion réelle sera activée après la configuration de Firebase.';
  }
});

// Cette version est une maquette d'interface : aucune donnée personnelle n'est collectée.
