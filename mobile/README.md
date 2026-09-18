# Task Manager — Application mobile Flutter

Application mobile consommant la même API Spring Boot que le frontend web,
avec le même jeton JWT. Étape 3 (bonus) du test de recrutement.

## Stack

| Élément | Choix |
|---|---|
| Framework | Flutter 3.38 / Dart 3 |
| Appels HTTP | `dio` |
| Persistance du jeton | `shared_preferences` |
| État | `ChangeNotifier` (pas de dépendance externe) |

## Démarrage

Le backend doit tourner au préalable (voir `../backend/README.md`).

```bash
flutter pub get
flutter run
```

### Adresse de l'API selon la cible

Un émulateur Android ne voit pas le `localhost` de la machine hôte : il doit
passer par `10.0.2.2`. `lib/core/api_config.dart` choisit automatiquement
la bonne adresse, et reste surchargeable au lancement :

```bash
# Appareil physique sur le même réseau Wi-Fi
flutter run --dart-define=API_BASE_URL=http://192.168.1.20:8080
```

| Cible | Adresse utilisée |
|---|---|
| Émulateur Android | `http://10.0.2.2:8080` |
| iOS / desktop | `http://localhost:8080` |
| Web | `http://localhost:8080` |

### Tests

```bash
flutter test
flutter analyze
```

## Fonctionnalités

| Exigence du sujet | Implémentation |
|---|---|
| Connexion via l'API Spring Boot, même JWT | `AuthController`, jeton conservé entre deux lancements |
| Affichage et gestion des tâches | `TasksScreen` + `ListView.builder` |
| Appels API avec `dio` | `ApiClient` |
| `ListView`, `TextField`, `ElevatedButton` | Liste, recherche et formulaires |

Au-delà du minimum demandé : inscription depuis le mobile, filtrage par statut,
recherche débouncée, détail d'une tâche, suppression avec confirmation, et
tirer-pour-rafraîchir.

## Architecture

```
lib/
├── core/       tokens de design, thème, adresse de l'API, erreurs
├── models/     Task, User, TaskStatus
├── services/   client dio, stockage du jeton, appels auth et tâches
├── state/      AuthController, TaskController
├── screens/    connexion, inscription, liste, détail, formulaire
└── widgets/    logo, pastille de statut, carte de tâche
```

### Choix techniques

**La même règle de statut que le backend.** La progression est à sens unique
(`TODO → IN_PROGRESS → DONE`). `TaskStatus.canMoveTo` reproduit la règle pour
désactiver ce qui est interdit, mais c'est le serveur qui l'applique : il
répond `409 Conflict` à toute tentative de retour en arrière. Sur une tâche
terminée, la case à cocher devient un simple indicateur non décochable.

**Le jeton est revalidé, jamais présumé valide.** Au lancement, la présence
d'un jeton en mémoire ne prouve rien. `AuthController.bootstrap()` appelle
`/api/auth/me` et affiche un écran de chargement pendant ce temps, plutôt que
de faire clignoter l'écran de connexion à chaque ouverture.

**Un 401 purge la session, où qu'il survienne.** `ApiClient` expose un
rappel global : n'importe quel appel recevant un 401 efface le jeton et
ramène à la connexion, sans traiter ce cas dans chaque écran.

**Filtrage et recherche côté serveur.** Comme sur le web, les paramètres
`?status=` et `?search=` sont délégués à l'API plutôt que d'être refaits en
mémoire, et la recherche est débouncée à 350 ms.

**Protection contre les réponses hors séquence.** `TaskController` incrémente
un identifiant de requête et ignore toute réponse qui n'est pas la plus
récente : sans cela, une réponse lente pour « ba » pourrait écraser le
résultat déjà affiché pour « backend ».

**Design partagé avec le web.** Les couleurs, rayons et élévations de
`../DESIGN.md` sont repris dans `lib/core/design.dart`, ce qui donne aux deux
applications la même identité visuelle.
