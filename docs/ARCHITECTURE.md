# Architecture

## Vue d'ensemble

```
TheCatAPI ──► services/catApi.js ──► hooks/use*.js ──► context/ ──► pages/ ──► components/
                  │                       │
            ApiError (status,       utils/errors.js
            path)                   (message lisible)
```

Chaque couche a une seule responsabilité :

- **`services/`** parle HTTP et rien d'autre. Il ajoute la clé, sérialise les corps, lève une `ApiError` avec le statut et le chemin quand la réponse n'est pas `ok`.
- **`hooks/`** transforme les appels en état React (`status`, `error`, données) et expose des actions (`loadMore`, `retry`, `toggle`, `vote`).
- **`context/`** partage ce qui sert à plusieurs pages : la liste des races et les favoris.
- **`pages/`** compose les hooks et les composants pour une route donnée et lit les paramètres d'URL.
- **`components/`** reçoit des props et affiche. Seule `CatGrid` lit le contexte des favoris, pour éviter de les faire transiter par toutes les pages.
- **`utils/`** contient des fonctions pures, faciles à tester.

## Décisions

### React Router en mode data

`createBrowserRouter` plutôt que `<BrowserRouter>` pour profiter d'`ErrorBoundary` par route (une erreur de rendu n'efface pas l'en-tête), de `ScrollRestoration` et de `createMemoryRouter` dans les tests. Les données ne passent pas par des `loader` : le module se concentre sur `useEffect` et `fetch`, et les hooks restent réutilisables hors routage.

### Contexte plutôt que bibliothèque d'état

Deux états seulement sont globaux (races, favoris) et ils changent peu. Deux contextes React suffisent, sans Redux ni Zustand. Ils utilisent l'API React 19 : `<BreedsContext value={…}>` et `use(BreedsContext)`. Un hook garde-fou lève une erreur si on les utilise hors du provider.

### L'état de l'interface dans l'URL

Le filtre de race de la galerie et les filtres de l'encyclopédie sont dans les paramètres de recherche. On peut partager un lien, revenir en arrière, recharger la page sans perdre sa recherche. Le champ texte garde un état local pour ne perdre aucune frappe pendant la mise à jour de l'URL.

### Pas de `setState` synchrone dans les effets

`eslint-plugin-react-hooks` 7 signale les `setState` appelés directement dans un effet. Le passage en `loading` se fait donc dans les gestionnaires (`loadMore`, `retry`, `skip`) et l'effet ne fait que lancer la requête puis écrire le résultat. Chaque effet ignore les réponses arrivées après son nettoyage, ce qui évite les courses quand on change vite de race.

### Galerie aléatoire ou paginée

Sans race, la galerie demande `order=RAND` : sinon TheCatAPI renvoie d'abord tous les Abyssins. Ce mode n'a pas de total, `hasMore` reste vrai. Avec une race, `order=ASC` donne une pagination stable et un total dans `pagination-count`. Les doublons sont filtrés à la fusion des pages.

### Erreurs

L'utilisateur ne voit jamais « HTTP 429 sur /favourites ». `describeError` traduit une `ApiError` ou une erreur réseau en phrase compréhensible, l'objet d'origine garde le détail technique. L'absence de clé API arrête l'application au démarrage avec un message explicite : mieux vaut échouer tout de suite qu'afficher une page vide.

### Styles

Une seule feuille CSS avec des variables (`--bg`, `--surface`, `--accent`…) redéfinies sous `[data-theme="dark"]`. Un script en ligne dans `index.html` pose `data-theme` avant le premier rendu. Pas de framework CSS : le projet reste lisible pour le module et le CSS pèse 17 ko.

### Tests

Les tests ciblent le comportement visible, pas l'implémentation :

- fonctions pures testées directement ;
- client HTTP testé avec `fetch` remplacé par `vi.stubGlobal` ;
- hooks testés avec `renderHook` et le service simulé par `vi.mock` ;
- parcours utilisateurs testés sur l'application complète (`App` + `createMemoryRouter`) avec Testing Library et `user-event`, requêtes par rôle et nom accessible.

La clé de test est injectée par `test.env` dans `vite.config.js`, aucun secret n'est nécessaire pour lancer la CI.

## Déploiement

GitHub Pages sert le site sous `/cat-gallery/`. Le build reçoit `BASE_PATH=/cat-gallery/`, que Vite utilise comme `base` et que le routeur reprend via `import.meta.env.BASE_URL`. Pages ne connaît pas les routes de l'application : `404.html` est une copie d'`index.html`, le routeur prend le relais côté client.
