# Task Manager — Frontend React

Interface web de gestion de tâches, consommant l'API Spring Boot du dossier `backend/`.
Étape 2 du test de recrutement.

## Stack

| Élément | Choix |
|---|---|
| Framework | React 19 + Vite 8 |
| Langage | TypeScript (mode `strict`) |
| Styles | Tailwind CSS v4 (thème CSS-first) |
| Routage | React Router 7 |
| Icônes | lucide-react |

## Démarrage

Le backend doit tourner au préalable (voir `../backend/README.md`) :

```bash
npm install
npm run dev
```

L'application est servie sur `http://localhost:5173`.

Les appels partent en relatif vers `/api` et sont redirigés vers
`http://localhost:8080` par le proxy de Vite. Aucune URL absolue n'apparaît dans
le code, et le navigateur ne voit qu'une seule origine — donc aucun préflight
CORS en développement. Pour viser une autre API, définir `VITE_API_TARGET`.

```bash
npm run build     # vérification TypeScript + bundle de production
npm run lint
```

## Design system

L'apparence est entièrement dérivée de `../DESIGN.md`. Les tokens (couleurs,
rayons, ombres, familles typographiques) sont déclarés une seule fois dans
`src/index.css` via la directive `@theme` de Tailwind v4, puis consommés sous
forme de classes utilitaires.

Conséquence volontaire : **aucune valeur brute** (`#2563eb`, `12px`…) n'apparaît
dans les composants. Changer une couleur du thème se fait à un seul endroit.

- **Plus Jakarta Sans** pour les titres, **Inter** pour tout le reste
- Gradient `135deg` réservé aux actions primaires et aux écrans d'authentification
- Quatre niveaux d'élévation à ombres teintées, jamais d'ombre noire franche
- Bordure hairline `1px` sur chaque surface flottante

## Fonctionnalités

| Exigence du sujet | Implémentation |
|---|---|
| Formulaire d'inscription / connexion | `LoginPage`, `RegisterPage` |
| Liste de tâches dynamique | `TaskTable`, chargée via `fetch` |
| Ajout / édition / suppression | `TaskFormModal`, `DeleteTaskDialog` |
| Filtrage par statut | `FilterTabs`, délégué au paramètre `?status=` de l'API |
| Champ de recherche | Barre d'en-tête, débouncée, paramètre `?search=` |
| Gestion des erreurs API | Toasts + messages sous les champs concernés |
| Stockage du token JWT | `localStorage`, clé `taskflow.token` |
| Détail d'une tâche | `TaskDetailModal`, ouverte au clic sur une ligne |
| Progression à sens unique | Étapes franchies verrouillées, case à cocher non décochable |

## Architecture

```
src/
├── types/        miroir des DTO de l'API
├── lib/          client fetch, helpers de dates et de classes
├── context/      AuthProvider, ToastProvider
├── hooks/        useAuth, useTasks, useToast, useDebounced
├── components/
│   ├── ui/       Button, Input, Modal, StatusBadge
│   ├── layout/   Sidebar, AppLayout, AuthLayout, ProtectedRoute
│   └── tasks/    StatCards, FilterTabs, TaskTable, modales, EmptyState
└── pages/        Login, Register, Tasks, Settings
```

### Choix techniques

**Filtrage et recherche côté serveur.** Les onglets de statut et la barre de
recherche relancent un appel à l'API plutôt que de filtrer un tableau en
mémoire. C'est le comportement correct dès que le volume dépasse ce qu'on veut
charger d'un coup, et cela exerce réellement les paramètres exposés par le backend.

**Recherche débouncée et protégée contre les réponses hors séquence.**
`useTasks` incrémente un identifiant de requête et ignore toute réponse qui
n'est pas la plus récente : sans cela, une réponse lente pour « ba » pourrait
écraser le résultat déjà affiché pour « backend ».

**Le token est revalidé, jamais présumé valide.** Au chargement, la présence
d'un jeton en `localStorage` ne prouve rien — il peut être expiré. `AuthProvider`
appelle `/api/auth/me` avant d'afficher quoi que ce soit, et `ProtectedRoute`
affiche un état de chargement pendant ce temps plutôt que de faire clignoter
l'écran de connexion à chaque rafraîchissement.

**Un 401 purge la session, où qu'il survienne.** Le client `fetch` expose un
gestionnaire global : n'importe quel appel recevant un 401 efface le jeton et
renvoie vers la connexion, sans avoir à traiter ce cas dans chaque composant.

**Les erreurs de validation vont sous les champs.** Le backend renvoie un objet
`fieldErrors` ; le front l'affiche au niveau du champ concerné et réserve les
toasts aux erreurs globales.

**La règle de progression vient du serveur.** Le statut ne peut qu'avancer
(`TODO → IN_PROGRESS → DONE`). `src/lib/status.ts` reproduit cette règle pour
griser ce qui est interdit, mais c'est le backend qui l'applique : il répond
`409 Conflict` à toute tentative de retour en arrière. L'interface guide,
elle n'autorise pas.

**Aucune donnée fictive.** Les trois indicateurs du tableau de bord sont
calculés à partir des tâches réellement chargées. Les champs que l'API
n'expose pas (priorité, échéance, assignation) ne sont pas affichés plutôt
que simulés.

## Accessibilité

Labels associés à chaque champ, `aria-label` sur les boutons à icône seule,
`aria-invalid` sur les champs en erreur, `aria-pressed` sur les onglets,
fermeture des modales par `Échap` et blocage du défilement de l'arrière-plan.
Un unique anneau de focus visible est défini globalement.
