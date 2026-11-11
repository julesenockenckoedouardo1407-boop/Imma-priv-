IMMA PRIVÉ — MODULE DE LIAISON RÉELLE IMMA COUPLE

CE QUE CE MODULE FAIT
1. Inscription et connexion par e-mail/mot de passe avec Firebase Authentication.
2. À l'inscription, le profil est créé avec status="pending" et ageConfirmed=true.
3. L'administration doit approuver les deux profils (status="approved").
4. Un membre approuvé envoie une invitation à l'e-mail du partenaire.
5. Le partenaire se connecte et accepte. Une Cloud Function vérifie les deux comptes et crée la liaison dans une transaction.
6. Les membres ne peuvent pas créer ou modifier eux-mêmes les invitations, les liaisons ou le statut d'approbation.

AVANT DE COMMENCER
- Créez/sélectionnez un projet Firebase.
- Activez Authentication > Sign-in method > Email/Password.
- Créez Firestore Database.
- Dans les paramètres du projet, copiez la configuration Web Firebase.
- Remplacez les quatre valeurs dans public/app.js (apiKey, authDomain, projectId, appId).
- Installez Node.js et Firebase CLI sur un ordinateur, puis connectez-vous à Firebase CLI.

DÉPLOIEMENT (dans le dossier décompressé)
1. firebase login
2. firebase use --add
3. cd functions
4. npm install
5. revenez au dossier racine
6. firebase deploy --only functions
7. Publiez les règles Firestore après les avoir fusionnées avec les règles existantes.
8. firebase deploy --only hosting

IMPORTANT — RÈGLES FIRESTORE
Le fichier firestore.rules de ce paquet est un modèle autonome pour le module de liaison. NE LE COLLEZ PAS TEL QUEL si votre projet contient déjà IMMA Communauté, Messenger, Love ou Fantasy : cela pourrait bloquer ces autres modules. Il faut fusionner les blocs match avec vos règles actuelles et éviter les doublons incompatibles pour /users.

APPROBATION ADMIN
Votre ancien système V3 utilisait status="pending"/"approved". Continuez à approuver les profils avec votre tableau de bord administrateur existant. Ne donnez jamais le droit au navigateur de modifier le champ status ou coupleId.
Pour un premier test, créez deux comptes avec deux adresses e-mail différentes, puis approuvez-les depuis l'administration.

LIMITES ET SÉCURITÉ
- La case 18+ est une déclaration, pas une vérification légale d'identité ou d'âge.
- Le serveur vérifie le statut approuvé et la déclaration 18+, mais un véritable déploiement public nécessite une procédure d'assurance d'âge adaptée aux lois applicables.
- Cette liaison associe deux comptes après acceptation explicite; elle ne permet pas de messagerie, d'appel ou de partage de photos.
- Pour défaire une liaison, il faudra ajouter une fonction serveur de rupture avec confirmation des deux membres ou une procédure d'assistance sécurisée.
- Ajoutez une protection anti-abus/rate limiting et une politique de confidentialité avant ouverture au public.
- Les invitations et liens sont lisibles uniquement par les membres concernés selon les règles ci-jointes.
- Ne publiez jamais de clé de compte de service Firebase dans le dossier public.
