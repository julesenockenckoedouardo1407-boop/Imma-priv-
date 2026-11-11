IMMA PRIVÉ — VERSION 7 : IMMA FANTASY
======================================

NOUVEAUTÉS
- Carnet personnel de notes.
- Titres et catégories personnalisables.
- Recherche dans ses propres notes.
- Suppression d'une note.
- Les notes sont privées : seul leur propriétaire peut les lire ou les supprimer.
- Fenêtre « À propos » avec la mention demandée : « Imma & Enock ».

CONFIGURATION
1. Décompresse le ZIP.
2. Remplace les valeurs dans firebase-config.js par celles de ton projet Firebase.
3. Utilise le même projet Firebase que les autres versions.
4. Vérifie que Firebase Authentication Email/Password est activé.
5. Publie les règles Firestore de ce fichier seulement après avoir sauvegardé et fusionné les règles des autres modules si tu veux conserver toutes les fonctionnalités.
6. Héberge les fichiers sur HTTPS et autorise le domaine dans Firebase Authentication.
7. Connecte-toi avec un compte dont le statut est approved et adultConfirmed vaut true.

IMPORTANT
- Ce module est un carnet de notes privé. Il ne permet pas de publier ou d'envoyer ces notes à d'autres membres.
- Les notes ne sont pas chiffrées de bout en bout. Firebase applique les règles d'accès, mais l'administrateur du projet et les personnes ayant des privilèges serveur peuvent avoir des accès techniques. Ne stocke pas de secrets, de mots de passe, d'informations bancaires ou d'autres données sensibles.
- Ne rédige pas de contenu intime concernant une autre personne sans son consentement.
- La déclaration 18+ des autres modules n'est pas une vérification officielle de l'âge.
- Avant lancement public, fais auditer les règles, ajoute modération, signalement, blocage, suppression de compte et politique de confidentialité.
- Les règles de ce fichier ne contiennent que les collections users et fantasyNotes. Il faut fusionner les règles V2 à V6 pour un projet complet.
