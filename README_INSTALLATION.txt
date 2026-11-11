IMMA PRIVÉ — MODULE IMMA COUPLE (MISE À JOUR)

Les fichiers que vous avez fournis ont servi de base à ce paquet. Cette version ajoute :
- Refuser une invitation reçue.
- Annuler une invitation envoyée.
- Demander la rupture d'une liaison.
- Exiger la confirmation de l'autre partenaire avant de supprimer la liaison.
- Les opérations sensibles sont effectuées par Cloud Functions; les règles client bloquent l'écriture directe des invitations et liaisons.

ATTENTION : vous avez envoyé les fichiers du module de liaison (index.html, app.js, style.css, index.js, règles et configuration), pas l'archive complète du site IMMA PRIVÉ. Ce ZIP est donc un module autonome mis à jour, PAS une fusion avec Communauté, Messenger, Love et Fantasy.

CONFIGURATION
1. Remplacez les valeurs de firebaseConfig dans public/app.js par celles du projet Firebase.
2. Activez Authentication Email/Password et Firestore.
3. Dans le dossier du projet, installez Firebase CLI et connectez-vous.
4. Sélectionnez votre projet avec firebase use --add.
5. Dans functions : npm install.
6. Déployez les fonctions : firebase deploy --only functions.
7. Fusionnez firestore.rules avec les règles de votre application existante avant de publier. Ne remplacez pas vos règles globales par le fichier de ce module.
8. Déployez l'hébergement si vous utilisez Firebase Hosting.

STRUCTURE
public/index.html, public/app.js, public/style.css
functions/index.js, functions/package.json
firebase.json, firestore.rules

SÉCURITÉ
- La case 18+ reste une déclaration et ne vérifie pas légalement l'âge.
- Les deux comptes doivent être approuvés par l'administration.
- Le partenaire doit accepter l'invitation.
- La rupture n'est finalisée qu'après la confirmation de l'autre partenaire.
- Avant un lancement public, ajoutez une vraie procédure d'assurance d'âge, une politique de confidentialité, une protection anti-abus et faites auditer les règles.
- Ne placez jamais de clé de compte de service dans le dossier public.
