# Task Manager — API Spring Boot

API REST de gestion de tâches avec authentification JWT.
Étape 1 du test de recrutement.

## Stack

| Élément | Choix |
|---|---|
| Langage | Java 21 |
| Framework | Spring Boot 3.5.0 |
| Persistance | Spring Data JPA / Hibernate 6 + MySQL 8 |
| Sécurité | Spring Security + JWT (JJWT 0.12.6), mots de passe hachés BCrypt |
| Build | Maven |
| Tests | JUnit 5 + MockMvc, sur H2 en mémoire |

## Démarrage rapide

### Option 1 — MySQL via Docker (par défaut)

```bash
docker compose up -d     # MySQL 8 sur le port 3307
mvn spring-boot:run
```

Le profil `docker` est actif par défaut : aucun argument n'est nécessaire, y compris
en lançant la classe `TaskManagerApplication` directement depuis un IDE.

### Option 2 — MySQL installé localement

Copier `src/main/resources/application-local.yml.example` en `application-local.yml`
(ce fichier est git-ignoré), y renseigner l'utilisateur et le mot de passe, puis :

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

La base `taskmanager` est créée automatiquement au premier démarrage
(`createDatabaseIfNotExist=true`), de même que les tables (`ddl-auto: update`).

L'API écoute sur `http://localhost:8080`.

### Consulter la base

Une interface web optionnelle (Adminer) permet d'inspecter les données :

```bash
docker compose --profile tools up -d    # démarre Adminer en plus de MySQL
```

Puis `http://localhost:8081` — serveur `mysql`, utilisateur `taskuser`,
mot de passe `taskpassword`, base `taskmanager`.

Elle n'est pas démarrée par un `docker compose up -d` classique : elle est
réservée au profil Compose `tools` et ne fait donc pas partie de la pile
applicative.

En ligne de commande :

```bash
docker exec -it taskmanager-mysql mysql -h127.0.0.1 -utaskuser -ptaskpassword taskmanager
```

### Tests

```bash
mvn test
```

Les tests tournent sur H2 en mémoire : **aucune base MySQL n'est nécessaire**,
ce qui permet de les exécuter tels quels en CI.

## Endpoints

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Inscription. Renvoie `201` + JWT |
| POST | `/api/auth/login` | — | Connexion. Renvoie `200` + JWT |
| GET | `/api/auth/me` | JWT | Profil courant (revalidation de token côté front) |
| GET | `/api/tasks` | JWT | Liste des tâches. Filtres `?status=` et `?search=` |
| GET | `/api/tasks/{id}` | JWT | Détail d'une tâche |
| POST | `/api/tasks` | JWT | Création. Renvoie `201` |
| PUT | `/api/tasks/{id}` | JWT | Modification |
| DELETE | `/api/tasks/{id}` | JWT | Suppression. Renvoie `204` |

Le token se transmet via l'en-tête `Authorization: Bearer <token>`.

Statuts possibles d'une tâche : `TODO`, `IN_PROGRESS`, `DONE`.

### Exemple

```bash
# Inscription
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Zuber","email":"zuber@test.com","password":"password123"}'

# Création d'une tâche
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Finir le test","description":"Backend","status":"IN_PROGRESS"}'

# Filtrage + recherche
curl "http://localhost:8080/api/tasks?status=DONE&search=test" \
  -H "Authorization: Bearer $TOKEN"
```

## Architecture

```
controller/   couche HTTP : validation des entrées, codes de retour
service/      règles métier et transactions
repository/   accès aux données (Spring Data JPA)
entity/       modèle persistant : User, Task
dto/          contrats d'API (records) — les entités ne sortent jamais telles quelles
security/     génération/validation JWT, filtre d'authentification
config/       sécurité HTTP, CORS, BCrypt
exception/    traduction des erreurs en JSON homogène
```

### Choix techniques

**DTO plutôt qu'exposition directe des entités** — le hash du mot de passe ne peut
pas fuir accidentellement dans une réponse, et le contrat d'API reste stable si le
modèle évolue.

**Cloisonnement par utilisateur** — toute lecture ou écriture d'une tâche passe par
`findByIdAndUserId`. Un utilisateur qui tente d'accéder à la tâche d'un autre reçoit
`404` et non `403` : on ne révèle pas l'existence de la ressource. Couvert par un test.

**Filtrage et recherche côté SQL** — une seule requête paramétrée, pas de filtrage en
mémoire, ce qui reste correct quand le volume de tâches grandit.

**Sessions stateless** — aucune session serveur, l'état tient dans le JWT.
Nécessaire pour un déploiement multi-instance (Cloud Run) et pour le client mobile.

**Erreurs normalisées** — toutes les erreurs sortent au même format
(`timestamp`, `status`, `error`, `message`, `path`, `fieldErrors`), y compris les
401 émis par la couche sécurité. Le frontend a un seul cas à traiter pour ses toasts.

**Aucun secret en dur** — toute la configuration sensible passe par variables
d'environnement (voir `.env.example`), avec des valeurs de développement par défaut.

## Configuration

| Variable | Défaut | Rôle |
|---|---|---|
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | Serveur MySQL |
| `DB_NAME` | `taskmanager` | Base de données |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / *(vide)* | Identifiants |
| `JWT_SECRET` | valeur de dev | Clé HMAC, **32 caractères minimum** |
| `JWT_EXPIRATION_MS` | `86400000` (24 h) | Durée de validité du token |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Origines autorisées |
| `SERVER_PORT` | `8080` | Port d'écoute |
| `SPRING_PROFILES_ACTIVE` | `docker` | Profil actif (`docker`, `local`, ou aucun en production) |

`GET /actuator/health` est exposé sans authentification pour les sondes de
disponibilité (Cloud Run, Docker healthcheck).
