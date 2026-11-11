IMMA PRIVÉ — VERSION 2 : AUTHENTIFICATION FIREBASE

Cette version ajoute le branchement Firebase Authentication et Firestore.
Elle n'est pas encore un réseau social complet : pas encore de chat, rencontres,
publications, médias ni panneau d'administration graphique.

ÉTAPE 1 — CRÉER FIREBASE
1. Ouvrir https://console.firebase.google.com/
2. Créer un projet nommé par exemple imma-prive.
3. Ajouter une application Web (icône </>).
4. Copier la configuration Firebase affichée.
5. Ouvrir firebase-config.js et remplacer chaque valeur REMPLACER par la valeur fournie.

ÉTAPE 2 — ACTIVER LES COMPTES
1. Dans Firebase, ouvrir Authentication > Sign-in method.
2. Activer Email/Password.
3. Ouvrir Firestore Database et créer la base de données.
4. Dans l'onglet Rules, publier le contenu de firestore.rules.

ÉTAPE 3 — APPROUVER UN MEMBRE
Les nouveaux comptes sont créés avec status = "pending".
Pour approuver un membre, l'administrateur doit être authentifié avec un compte
ayant le custom claim admin=true, puis modifier le document users/{uid} :
status : "approved".
Pour refuser : status : "rejected".

IMPORTANT : ne donnez jamais le rôle admin à un utilisateur depuis le navigateur.
Le custom claim admin doit être défini côté serveur par un environnement de confiance
(par exemple Firebase Admin SDK dans une fonction Cloud sécurisée).
La version actuelle ne contient pas encore d'interface admin.

ÉTAPE 4 — TESTER
Les modules JavaScript chargés depuis Firebase ne fonctionnent pas correctement
en ouvrant simplement index.html en fichier local. Hébergez le dossier via un
serveur HTTPS (Firebase Hosting, GitHub Pages ou autre hébergement statique).
N'oubliez pas d'ajouter le domaine d'hébergement dans Firebase Authentication
> Settings > Authorized domains.

SÉCURITÉ
- Les règles Firestore sont un point de départ restrictif, pas un audit de sécurité.
- Le contrôle de l'âge par case à cocher n'est pas une vérification d'âge robuste.
  Avant un lancement public, ajouter une méthode de vérification adaptée au pays
  et aux obligations légales.
- Prévoir politique de confidentialité, suppression de compte, modération,
  signalement, blocage et procédure de traitement des abus.
- Ne pas stocker de mots de passe dans Firestore.
- Ne pas publier de clés privées ni de comptes de service.
- Ne jamais garantir qu'une capture d'écran est impossible.
- Les photos et vidéos ne sont pas activées dans cette version.
