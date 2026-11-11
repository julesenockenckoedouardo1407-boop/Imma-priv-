IMMA PRIVÉ — VERSION 4 : COMMUNAUTÉ
====================================

Cette version ajoute :
- Profil membre : pseudonyme et courte présentation.
- Fil de publications réservé aux membres validés.
- Publications textuelles (1000 caractères maximum).
- Réactions « J'aime ».
- Commentaires (300 caractères maximum).
- Conservation des validations administrateur de la version précédente.

IMPORTANT : ce ZIP est un socle technique. Il ne devient pas un réseau social opérationnel avant configuration et tests Firebase. Les photos, la messagerie privée, les notifications, les rencontres et les outils avancés de modération ne sont pas encore inclus.

ÉTAPE 1 — CRÉER / CONFIGURER FIREBASE
1. Ouvre https://console.firebase.google.com/
2. Crée un projet Firebase (ou utilise le projet déjà créé pour IMMA PRIVÉ).
3. Ajoute une application Web et copie sa configuration.
4. Ouvre firebase-config.js et remplace toutes les valeurs REM... par les vraies valeurs Firebase.
5. Dans Authentication > Sign-in method, active Email/Password.
6. Dans Firestore Database, crée la base de données.
7. Ouvre l'onglet Rules, colle le contenu de firestore.rules et publie les règles.

ÉTAPE 2 — HÉBERGER
- Héberge les fichiers sur un service HTTPS (par exemple Firebase Hosting ou GitHub Pages).
- Dans Firebase Authentication > Settings > Authorized domains, ajoute le domaine d'hébergement.
- N'ouvre pas index.html directement comme un fichier local : les modules Firebase nécessitent un hébergement web.

ÉTAPE 3 — COMPTE ADMINISTRATEUR
Le rôle admin doit être attribué depuis un environnement serveur de confiance avec Firebase Admin SDK.
Ne crée JAMAIS le rôle admin depuis le navigateur et ne demande pas aux membres de le faire.
Exemple conceptuel côté serveur :
  await getAuth().setCustomUserClaims(uid, { admin: true });
Après attribution, déconnecte/reconnecte le compte administrateur.

ATTENTION SUR LA VALIDATION
Cette version conserve le mécanisme de statut `pending` / `approved`. Le tableau de bord admin complet de V3 n'est pas intégré à cette page V4. L'approbation doit être faite par un outil serveur sécurisé ou par le tableau d'administration V3 déjà configuré. N'accorde pas des droits admin à un compte ordinaire.

RÈGLES DE SÉCURITÉ ET BONNES PRATIQUES
- Accès réservé aux personnes de 18 ans ou plus. La case d'âge est une déclaration, pas une vérification d'identité.
- N'autorise jamais les contenus intimes non consentis, les menaces, le harcèlement ou l'exploitation.
- Prévois une procédure de signalement, blocage et suppression avant un lancement public.
- Ne demande pas aux membres de publier leurs coordonnées, adresses ou informations sensibles.
- Les règles Firestore sont une base de départ : fais-les auditer et teste-les avant toute utilisation réelle.
- Cette version ne prend pas en charge le partage de photos ou de vidéos.

DÉPANNAGE
- « Firebase: Error » : vérifie firebase-config.js.
- « Missing or insufficient permissions » : vérifie que Firestore Rules ont été publiées et que le compte a le statut approved.
- Les nouveaux comptes sont en attente : c'est normal. Il faut les approuver par le mécanisme administrateur sécurisé.
