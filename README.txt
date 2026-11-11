IMMA PRIVÉ — VERSION 3 : TABLEAU DE BORD ADMINISTRATEUR

NOUVEAUTÉS
- Détection du rôle administrateur via le custom claim Firebase admin=true.
- Tableau de bord admin.
- Liste des membres, compteur par statut.
- Actions approuver, refuser et remettre en attente.
- Règles Firestore restrictives : un membre ordinaire ne peut pas changer son statut.

CONFIGURATION
1. Créez votre projet sur https://console.firebase.google.com/
2. Activez Authentication > Email/Password.
3. Créez Firestore Database.
4. Copiez la configuration Web dans firebase-config.js.
5. Publiez firestore.rules dans Firestore > Rules.
6. Hébergez le dossier en HTTPS (Firebase Hosting ou GitHub Pages) et ajoutez le domaine aux domaines autorisés Firebase.

CRÉER LE PREMIER ADMINISTRATEUR — ACTION SERVEUR REQUISE
L'interface ne permet volontairement PAS de se promouvoir administrateur.
Un développeur ou une personne de confiance doit utiliser Firebase Admin SDK depuis un environnement sécurisé
(par exemple Cloud Functions / serveur privé) pour attribuer le custom claim admin=true au compte de direction.
Exemple conceptuel côté serveur Node.js, à exécuter uniquement dans un environnement de confiance :
  await getAuth().setCustomUserClaims(uid, { admin: true });
Ne mettez jamais le code Admin SDK ni une clé de service dans le site web ou dans GitHub.
Après attribution, déconnectez/reconnectez le compte administrateur.

IMPORTANT
- Cette version ne comprend pas encore de messagerie, rencontres, publications, téléversement d'images ou modération de contenu.
- Les règles proposées doivent être testées et revues avant un lancement public.
- La case 18+ n'est pas une vérification d'âge robuste. Ajoutez un mécanisme adapté aux lois applicables avant ouverture au public.
- Prévoyez suppression de compte, gestion des données personnelles, signalement, blocage et politique de confidentialité.
- N'hébergez pas de contenus intimes sans consentement explicite et procédure de modération.
