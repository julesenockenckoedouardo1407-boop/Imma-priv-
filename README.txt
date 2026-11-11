IMMA PRIVÉ — VERSION 6 : IMMA LOVE
==================================

FONCTIONS DE CETTE MAQUETTE CONNECTÉE
- Connexion par compte Firebase existant.
- Accès réservé aux comptes dont `status` vaut `approved` et `adultConfirmed` vaut `true`.
- Profil Love : pseudonyme, présentation, centres d'intérêt et type de rencontre recherché.
- Découverte des profils Love publiés.
- Envoi d'un signe d'intérêt.
- Affichage des intérêts reçus et des affinités réciproques.

CONFIGURATION
1. Décompresse le ZIP.
2. Mets les informations Firebase de ton projet dans firebase-config.js.
3. Garde le même projet Firebase que les autres versions.
4. Publie les règles Firestore de ce fichier uniquement si tu sais que tu remplaces les règles existantes. Elles ne conservent pas les règles du fil communautaire V4 ni de Messenger V5. Pour réunir tous les modules, il faut fusionner les règles.
5. Héberge sur HTTPS et autorise le domaine dans Firebase Authentication.
6. Connecte-toi avec un compte adulte validé.

À SAVOIR
- Les profils sont créés dans la collection `loveProfiles` lorsque le membre ouvre IMMA LOVE.
- Les profils Love n'affichent pas l'adresse e-mail.
- Les intérêts sont stockés dans `loveLikes`. Une affinité réciproque doit être créée côté serveur ou via une fonction Firebase sécurisée. Cette version affiche la section des affinités, mais ne crée pas encore automatiquement le document de match. Il faudra ajouter une Cloud Function pour détecter les intérêts réciproques et créer `loveMatches` sans permettre aux utilisateurs de fabriquer eux-mêmes des matchs.
- Les filtres avancés, photos, chat depuis une affinité, blocage, signalement et modération ne sont pas inclus.

SÉCURITÉ ET RESPECT
- La case d'âge utilisée à l'inscription ne prouve pas l'âge réel.
- Ne publie aucune donnée permettant d'identifier ou de localiser précisément un membre.
- Aucun membre ne doit être obligé de répondre à un intérêt.
- Les comportements insistants, menaces, harcèlement, chantage ou partage non consenti d'images intimes doivent être interdits et traités.
- Avant une mise en ligne publique, ajoute vérification d'âge adaptée, blocage, signalement, suppression de compte, règles de modération, limitation anti-spam et politique de confidentialité.
- Fais auditer et tester les règles avec Firebase Emulator Suite avant usage réel.
