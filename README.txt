IMMA PRIVÉ — VERSION 5 : IMMA MESSENGER
=======================================

FONCTIONS
- Connexion avec le compte Firebase existant d'IMMA PRIVÉ.
- Liste des membres dont le compte est validé.
- Recherche par pseudonyme.
- Conversations privées entre deux membres validés.
- Messages textuels en temps réel.
- Interface adaptée au téléphone.

IMPORTANT
Cette version est un module de messagerie textuelle. Elle ne contient pas encore les appels audio/vidéo, les photos, les notes vocales, les notifications push, le blocage ni le signalement intégrés. N'utilise pas ce module en production avant d'avoir ajouté et testé ces fonctions de sécurité et de modération.

INSTALLATION
1. Décompresse ce ZIP.
2. Ouvre firebase-config.js et remplace les valeurs d'exemple par la configuration Web de TON projet Firebase.
3. Utilise le même projet Firebase que les versions précédentes (collection `users` et Authentification).
4. Dans Firebase Authentication, active Email/Password.
5. Dans Firestore > Rules, publie le contenu de firestore.rules.
6. Héberge les fichiers sur HTTPS et ajoute le domaine dans Authentication > Authorized domains.
7. Ouvre l'application hébergée et connecte-toi avec un compte dont `status` vaut `approved` et `adultConfirmed` vaut `true`.

ATTENTION AUX RÈGLES
Le fichier firestore.rules est spécifique au module V5 et remplace les règles précédentes si tu le publies tel quel. Il conserve la lecture des profils nécessaire à la liste des membres, mais il ne contient pas les règles des publications V4. Si tu veux conserver simultanément le fil communautaire V4 et Messenger V5, il faut fusionner les règles V4 et V5 avant publication. Ne remplace pas les règles de ton application existante sans sauvegarde.

ID DE CONVERSATION
Les deux identifiants utilisateurs sont triés pour obtenir un identifiant de conversation commun. Seuls les deux membres inscrits dans le document `conversations/{id}` peuvent lire et envoyer des messages.

SÉCURITÉ
- L'accès repose sur la validation de compte et la confirmation d'âge 18+.
- Une déclaration d'âge n'est pas une vérification officielle d'identité.
- N'envoie pas de photos intimes ou d'informations sensibles dans ce prototype.
- Avant un lancement public, ajoute blocage, signalement, suppression de compte, modération, limitation anti-spam et politique de confidentialité.
- Les règles doivent être testées avec Firebase Emulator Suite et révisées par une personne compétente.
