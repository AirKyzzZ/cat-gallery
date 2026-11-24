# Spécifications fonctionnelles

## Contexte

Cat Gallery est le projet du cours React du module DEVE515. L'objectif est une application React complète qui consomme une API REST réelle ([TheCatAPI](https://developers.thecatapi.com)), avec plusieurs pages, de l'état partagé, des appels réseau robustes, des tests et une chaîne CI/CD.

## Utilisateurs visés

Un amateur de chats qui veut parcourir des photos, découvrir des races et garder ses préférées, sur ordinateur comme sur mobile, sans créer de compte.

## Identification sans compte

Au premier lancement, l'application génère un identifiant aléatoire (`crypto.randomUUID()`) stocké dans `localStorage` sous `cat-gallery:sub-id`. Il est envoyé comme `sub_id` à TheCatAPI pour rattacher favoris et votes à ce navigateur. Vider le stockage du site revient à repartir de zéro.

## Pages et routes

| Route | Page | Paramètres d'URL |
| --- | --- | --- |
| `/` | Galerie | `race` : identifiant de race filtrée |
| `/races` | Encyclopédie des races | `q` recherche, `groupe` pelage, `origine` code pays, `tri` |
| `/races/:breedId` | Fiche d'une race | |
| `/vote` | Vote | |
| `/favoris` | Favoris | |
| toute autre URL | Page 404 | |

## User stories

### US-01 Parcourir la galerie

En tant que visiteur, je veux voir des photos de chats pour me divertir.

- La page d'accueil affiche 12 photos aléatoires avec leur race.
- « Voir plus de chats » ajoute 12 photos sans recharger la page ni créer de doublon.
- Pendant le chargement initial, des squelettes remplacent la grille.
- En cas d'échec, un message clair et un bouton « Réessayer » s'affichent.

### US-02 Filtrer par race

En tant que visiteur, je veux ne voir qu'une race.

- La liste déroulante « Race » contient toutes les races triées par nom.
- Choisir une race met à jour l'URL (`?race=…`), recharge la grille et affiche un résumé de la race avec un lien vers sa fiche.
- Le compteur indique le nombre de photos chargées sur le total disponible.
- Le bouton « Voir plus » disparaît quand toutes les photos sont chargées.

### US-03 Agrandir une photo

En tant que visiteur, je veux voir une photo en grand.

- Un clic sur une photo ouvre une visionneuse modale avec la position (« 3 / 24 »).
- Échap ferme, ← et → naviguent, un clic sur le fond ferme.
- Le focus va sur « Fermer » à l'ouverture et revient sur la vignette à la fermeture.
- La visionneuse propose le favori et un lien vers la fiche de la race.

### US-04 Gérer mes favoris

En tant que visiteur, je veux garder mes photos préférées.

- Le cœur d'une photo l'ajoute ou la retire des favoris sur TheCatAPI.
- Pendant la requête, le bouton est désactivé pour éviter les doubles clics.
- Le compteur de l'en-tête se met à jour immédiatement après la réponse.
- La page Favoris liste les photos, ou invite à explorer la galerie si elle est vide.
- Un échec affiche une alerte refermable, la liste reste inchangée.

### US-05 Explorer les races

En tant que curieux, je veux comparer les races.

- La page Races affiche une carte par race : photo de référence ou initiale, origine en français avec drapeau, type de pelage, trois traits de caractère.
- La recherche porte sur le nom et les noms alternatifs, sans tenir compte de la casse ni des accents.
- Les filtres pelage et origine se combinent avec la recherche.
- Les tris disponibles : nom A → Z, nom Z → A, longévité, poids.
- Le nombre de résultats est annoncé, un bouton réinitialise les filtres.
- L'état des filtres est conservé dans l'URL.

### US-06 Consulter une fiche race

- La fiche affiche nom, noms alternatifs, origine, pelage, description, espérance de vie, poids, taille, tempérament, histoire et un lien Wikipédia s'il existe.
- Une galerie paginée montre les photos de la race.
- Un identifiant inconnu affiche « Race introuvable » avec un retour à la liste.

### US-07 Voter

En tant que visiteur, je veux donner mon avis sur des chats au hasard.

- Un chat aléatoire s'affiche avec sa race et son origine.
- « J'aime » envoie un vote `1`, « Bof » un vote `-1`, « Passer » change de chat sans voter.
- Les flèches → et ← votent au clavier, sauf quand on tape dans un champ.
- Le score (j'aime / bof) et l'historique des 12 derniers votes se mettent à jour.
- L'API ne renvoie pas l'image d'un vote : les miniatures sont mémorisées localement au moment du vote (60 au maximum).

### US-08 Thème

- Le thème suit `prefers-color-scheme` tant que l'utilisateur n'a rien choisi.
- Le bouton de l'en-tête bascule clair / sombre et mémorise le choix.
- Le thème est appliqué avant le premier rendu (pas de flash).

## Endpoints TheCatAPI utilisés

| Méthode | Endpoint | Usage |
| --- | --- | --- |
| GET | `/breeds` | Liste des races (chargée une fois, partagée par contexte) |
| GET | `/images/search?order=RAND` | Galerie sans filtre |
| GET | `/images/search?breed_ids=…&order=ASC&page=…` | Galerie filtrée, total lu dans l'en-tête `pagination-count` |
| GET | `/images/search?limit=1` | Chat à noter |
| GET | `/favourites?sub_id=…` | Favoris de l'utilisateur |
| POST | `/favourites` | Ajout d'un favori |
| DELETE | `/favourites/:id` | Retrait d'un favori |
| GET | `/votes?sub_id=…` | Historique des votes |
| POST | `/votes` | Nouveau vote |

Toutes les requêtes portent l'en-tête `x-api-key`.

## Exigences non fonctionnelles

- **Performance** : images en `loading="lazy"`, races chargées une seule fois, requêtes obsolètes ignorées (flag `ignore` dans les effets).
- **Accessibilité** : navigation complète au clavier, focus visible, rôles et libellés ARIA, annonces `aria-live` pour les compteurs, animations désactivées si `prefers-reduced-motion`.
- **Responsive** : de 360 px à l'écran large, grille fluide, navigation qui passe sous le logo sur mobile.
- **Robustesse** : chaque appel réseau a un état chargement, succès et erreur. Les erreurs sont traduites en messages compréhensibles.
- **Qualité** : lint sans avertissement, tests verts et build réussi exigés par la CI avant tout déploiement.
- **Compatibilité** : navigateurs evergreen (Chrome, Firefox, Safari, Edge récents).

## Hors périmètre

- Comptes utilisateurs et synchronisation entre appareils.
- Envoi de photos (`/images/upload`).
- Traduction des textes renvoyés par l'API (descriptions et tempéraments restent en anglais).
- Proxy serveur pour masquer la clé API.

## Définition de « terminé »

Une fonctionnalité est terminée quand ses critères d'acceptation sont couverts par un test, que `npm run lint`, `npm test` et `npm run build` passent, et qu'elle a été vérifiée dans le navigateur en clair, en sombre et sur mobile.
