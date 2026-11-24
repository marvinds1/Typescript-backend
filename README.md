# mlaku-mulu-backend

REST API for a travel agency back office: admins manage customer accounts and their trips, customers can log in and see their own trips.

Built in 2023 with NestJS + MongoDB; refactored and upgraded in 2026.

## Stack

NestJS 12 (ESM), Mongoose 9 / MongoDB 7+, JWT (`@nestjs/jwt`), class-validator, Helmet, `@nestjs/throttler`, Jest + Supertest. TypeScript 6, Node ≥ 22.12.

## API

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/authentication/login` | public (rate limited) | Returns `{ user, token }` |
| POST | `/authentication/register` | admin | Create a customer |
| POST | `/authentication/register/admin` | admin | Create another admin |
| GET | `/authentication/getall?limit&skip` | admin | List users (paginated) |
| GET | `/authentication/check-token` | logged in | Current user |
| PATCH / DELETE | `/authentication/:id` | admin | Update / delete user (deletes their trips too) |
| POST | `/trip` | admin | Create a trip for a user |
| GET | `/trip?limit&skip` | admin | List all trips (paginated) |
| GET | `/trip/mytrip` | logged in | Own trips |
| GET | `/trip/:id` | owner or admin | Trip detail |
| PATCH / DELETE | `/trip/:id` | admin | Update / delete trip |

## Security fixes in the refactor

| Before | After |
| --- | --- |
| `AutGuard` only checked that an `Authorization` header existed — any string was accepted. | `AuthGuard` verifies the JWT signature (HS256 pinned), loads the user and rejects inactive/deleted accounts. |
| `AdminGuard` used `jwt.decode()` (no signature check), so a self-made token with `isAdmin: true` gave full admin access. | `AdminGuard` relies on the verified user loaded from the database. |
| `POST /register/admin` was public: anyone could create an admin. | Admin-only; the first admin is created with `npm run create-admin`. |
| The whole user document, **including the password hash**, was put in the JWT payload. | Payload is `{ sub, isAdmin }` only; `password` is `select: false`. |
| Any logged-in user could read any trip by id (IDOR). | Non-admins can only read their own trips. |
| `JWT_SEED` could be undefined (tokens signed with an empty secret). | App refuses to start unless `JWT_SEED` is set and ≥ 32 chars. |
| CORS `*`, no security headers, no rate limit. | CORS allow-list (`CORS_ORIGIN`), Helmet, global throttling + stricter login limit. |
| bcrypt cost 8, passwords up to 20 chars, user enumeration via different error messages. | bcrypt cost 12, 8–72 chars, single error message with constant-time dummy compare. |

## Correctness, concurrency & performance

- **IDs:** `_id = Date.now() + countDocuments()` produced duplicates under concurrent requests. Replaced by `randomUUID()` (still a string, so existing data stays compatible).
- **Duplicate emails:** unique index + `409 Conflict` mapping instead of a 500 (e2e test fires 5 parallel registrations and expects exactly one success).
- **Lost updates on trips:** `PATCH /trip/:id` uses optimistic concurrency (`updatedAt` as version) and returns `409` if the trip changed in between. Only provided fields are updated (the old code overwrote missing fields with `undefined`).
- `save()` calls that were not awaited (errors silently lost) are fixed; deleting a user now deletes their trips (it used to run `deleteMany` on the users collection).
- Updating a user re-hashed the *old* password; it now hashes the new one.
- Dates are validated as real dates and start ≤ end, also on partial updates.
- Lists are paginated (max 200), read paths use `.lean()`, `idUser` is indexed, Mongo errors are mapped to 400/409 by a global filter.

## Running

```bash
cp .env.example .env
npm install
npm run build
ADMIN_PASSWORD='choose-a-strong-one' npm run create-admin -- "Admin" admin@example.com
npm run start:prod
```

```bash
npm run lint
docker run -d --rm -p 27017:27017 --name mongo mongo:8
MONGO_URI=mongodb://127.0.0.1:27017 MONGO_DB_NAME=e2e npm run test:e2e
```

NestJS 12 ships as ESM only, so Jest runs with `--experimental-vm-modules` (set in the npm scripts).
