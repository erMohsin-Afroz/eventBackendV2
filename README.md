# Event Organise Backend

REST API backend for the Event Organise Flutter application.

> **Documentation source:** This README describes the code in this backend project (`src/routes/index.ts`, `src/schemas/`, `src/app.ts`, `src/config/env.ts`, and `prisma/schema.prisma`). It does not describe routes that are not registered in the current source. If an endpoint is added or changed, update this document with the implementation.

## Contents

- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Environment configuration](#environment-configuration)
- [Installation and run](#installation-and-run)
- [Base URLs](#base-urls)
- [Authentication and authorization](#authentication-and-authorization)
- [API endpoints](#api-endpoints)
- [Request field reference](#request-field-reference)
- [Database schema](#database-schema)
- [Validation and error responses](#validation-and-error-responses)
- [Flutter Android emulator connection](#flutter-android-emulator-connection)
- [Current limitations and integration notes](#current-limitations-and-integration-notes)

## Technology stack

| Technology | Version / purpose |
|---|---|
| Node.js | Node.js runtime; Node.js 22 LTS is recommended by the project setup notes |
| Express | 5.3.0 — HTTP server and REST routing |
| TypeScript | 5.9.3 — typed backend source |
| Prisma | 6.19.3 — ORM and database access |
| SQLite | Relational database configured in Prisma |
| Zod | 4.6.7 — request-body validation |
| bcryptjs | Password hashing and password verification |
| jsonwebtoken | JWT access-token creation and verification |
| CORS | Cross-origin request middleware |
| dotenv | Environment-variable loading |
| Swagger UI Express | Interactive API documentation UI |
| tsx | TypeScript execution and development watch mode |

## Project structure

```text
BackendV2/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/          # Environment, Prisma and Swagger configuration
│   ├── controllers/     # HTTP request/response handlers
│   ├── middlewares/     # Authentication and request validation
│   ├── repositories/    # Database access layer
│   ├── routes/          # Express route registration
│   ├── schemas/         # Zod request schemas
│   ├── services/        # Application/business logic
│   ├── types/           # Express type extensions
│   ├── utils/           # Shared errors and utilities
│   ├── app.ts           # Express app and middleware registration
│   └── server.ts        # Database connection and HTTP startup
├── .env                 # Local secrets/configuration (do not commit)
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Requirements

- Node.js (Node.js 22 LTS recommended)
- npm
- SQLite (Prisma uses the configured SQLite database file)

## Environment configuration

Create a `.env` file in the backend root. The application validates these variables at startup:

| Variable | Required | Default / rule | Description |
|---|---:|---|---|
| `NODE_ENV` | No | `development` | Allowed values: `development`, `production`, `test` |
| `PORT` | No | `3000` | HTTP server port; must be a positive integer |
| `DATABASE_URL` | Yes | No default | Prisma SQLite connection string, e.g. `file:./dev.db` |
| `JWT_SECRET` | Yes | Minimum 32 characters | Secret used to sign and verify JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry duration |
| `CORS_ORIGIN` | No | `*` | CORS origin setting. Note: current `app.ts` calls `cors()` without passing this variable, so the variable is validated but is not currently applied to the CORS middleware. |

Example local configuration:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-this-with-a-random-secret-at-least-32-characters-long"
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

`DATABASE_URL` is interpreted by Prisma relative to the Prisma schema location when using a relative SQLite file path. Keep real secrets out of source control. Do not copy production secrets into documentation or share them in chat.

## Installation and run

Run these commands from the `BackendV2` directory:

```bash
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run dev
```

For an existing database with migrations already created, use the project's migration workflow rather than creating a second initial migration.

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Run the server in development mode with `tsx watch` |
| `npm run typecheck` | Run TypeScript type checking without emitting files |
| `npm run build` | Compile TypeScript into the configured output directory |
| `npm start` | Run the compiled server |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate -- --name <migration-name>` | Create/apply a development migration |
| `npm run db:studio` | Open Prisma Studio |

## Base URLs

The Express application registers the following paths:

| Purpose | URL (with `PORT=5000`) |
|---|---|
| Health check | `http://localhost:5000/health` |
| API base | `http://localhost:5000/api` |
| Swagger UI | `http://localhost:5000/api-docs` |

The API routes below are relative to `/api`. For example, `POST /auth/login` is called at `http://localhost:5000/api/auth/login`.

## Authentication and authorization

- `POST /auth/signup` creates an attendee or organiser account.
- `POST /auth/login` validates credentials and returns a JWT access token.
- Protected routes require the header:

```http
Authorization: Bearer <access-token>
```

- Passwords are hashed with `bcryptjs` using a work factor of 12. Plain-text passwords are not stored.
- The JWT contains `userId`, `tenantId`, and `role` claims.
- The current signup service assigns the `default` tenant. The current login schema accepts only `email` and `password`.
- The current route file does not register a logout endpoint, refresh-token endpoint, `/auth/me`, or OTP endpoint.
- The authentication middleware protects routes marked **Yes** in the endpoint catalogue. Role/ownership checks are applied in the corresponding service/controller where implemented; do not assume every authenticated route is available to every role.

## API endpoints

**Legend:** `Auth: Yes` means a valid Bearer token is required. `Auth: No` means the route is registered without the authentication middleware. All paths are relative to `/api`.

### Health and authentication

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/health` | No | Backend health check (root path; not under `/api`) |
| POST | `/auth/signup` | No | Create an attendee or organiser account |
| POST | `/auth/login` | No | Authenticate and receive a JWT |

### User and organiser profiles

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/users/profile` | Yes | Get the authenticated user's profile |
| PATCH | `/users/profile` | Yes | Update the authenticated user's profile |
| GET | `/organisers/profile` | Yes | Get the organiser profile |
| POST | `/organisers/profile` | Yes | Create an organiser profile |
| PATCH | `/organisers/profile` | Yes | Update the organiser profile |

### Events

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/events` | No | List published events |
| GET | `/events/:eventId` | Yes | Get an event by ID |
| POST | `/events` | Yes | Create an event |
| PATCH | `/events/:eventId` | Yes | Update an event |
| DELETE | `/events/:eventId` | Yes | Delete an event |

### Agenda days

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/events/:eventId/agenda` | No | Get agenda days for an event |
| POST | `/events/:eventId/agenda` | Yes | Create an agenda day |
| PATCH | `/agenda/:agendaDayId` | Yes | Update an agenda day |
| DELETE | `/agenda/:agendaDayId` | Yes | Delete an agenda day |

### Sessions

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/events/:eventId/sessions` | No | List sessions for an event |
| POST | `/events/:eventId/sessions` | Yes | Create a session |
| PATCH | `/sessions/:sessionId` | Yes | Update a session |
| DELETE | `/sessions/:sessionId` | Yes | Delete a session |
| PATCH | `/sessions/:sessionId/favorite` | Yes | Set a session's favourite state |

### Locations

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/events/:eventId/locations` | No | List event locations |
| POST | `/events/:eventId/locations` | Yes | Create a location |
| PATCH | `/locations/:locationId` | Yes | Update a location |
| DELETE | `/locations/:locationId` | Yes | Delete a location |

### Speakers

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/events/:eventId/speakers` | No | List event speakers |
| POST | `/events/:eventId/speakers` | Yes | Create a speaker |
| PATCH | `/speakers/:speakerId` | Yes | Update a speaker |
| DELETE | `/speakers/:speakerId` | Yes | Delete a speaker |

### Registrations

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| POST | `/events/:eventId/registrations` | Yes | Register the authenticated attendee for an event |
| GET | `/events/:eventId/registrations` | Yes | List registrations for an event |
| PATCH | `/registrations/:registrationId/cancel` | Yes | Cancel a registration |
| PATCH | `/registrations/:registrationId/review` | Yes | Approve, reject, or mark a registration pending |

### Check-in

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| POST | `/events/:eventId/check-in` | Yes | Check in an attendee using a QR token |
| GET | `/events/:eventId/check-ins` | Yes | List check-ins for an event |

### Invitations

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| POST | `/events/:eventId/invitations` | Yes | Create invitation records for email addresses |
| GET | `/events/:eventId/invitations` | Yes | List invitations for an event |
| POST | `/invitations/validate` | No | Validate an invitation code |

### Feedback

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| POST | `/events/:eventId/feedback` | Yes | Submit event feedback |
| GET | `/events/:eventId/feedback` | Yes | List feedback for an event |

### FAQs

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/faqs` | No | List published FAQs |
| POST | `/faqs` | Yes | Create an FAQ |
| PATCH | `/faqs/:faqId` | Yes | Update an FAQ |
| DELETE | `/faqs/:faqId` | Yes | Delete an FAQ |

### Notifications

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/notifications` | Yes | List notifications |
| POST | `/notifications` | Yes | Create a notification |
| PATCH | `/notifications/:notificationId` | Yes | Update notification read/pinned state |
| DELETE | `/notifications/:notificationId` | Yes | Delete a notification |

### Favourites

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/favorites` | Yes | List the authenticated user's favourites |
| POST | `/favorites` | Yes | Add a favourite |
| DELETE | `/favorites/:itemType/:itemId` | Yes | Remove a favourite |

### Help desk

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/events/:eventId/help-desk` | No | List published/enabled help-desk contacts |
| POST | `/events/:eventId/help-desk` | Yes | Create a help-desk contact |
| PATCH | `/help-desk/:contactId` | Yes | Update a help-desk contact |
| DELETE | `/help-desk/:contactId` | Yes | Delete a help-desk contact |

### Support inquiries

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| POST | `/events/:eventId/support-inquiries` | Yes | Submit a support inquiry |
| GET | `/support-inquiries/my` | Yes | List the authenticated user's inquiries |
| GET | `/events/:eventId/support-inquiries` | Yes | List inquiries for an event (organiser workflow) |
| PATCH | `/support-inquiries/:inquiryId` | Yes | Update inquiry status, priority or response fields |

### Quizzes

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| POST | `/quizzes` | Yes | Create a quiz, including its question payload |
| GET | `/events/:eventId/quizzes` | Yes | List published quizzes for an event |
| GET | `/quizzes/:quizId` | Yes | Get quiz details for an attendee |
| POST | `/quizzes/:quizId/attempts` | Yes | Start or resume a quiz attempt |
| POST | `/quiz-attempts/:attemptId/submit` | Yes | Submit answers for an attempt |
| GET | `/quiz-attempts/:attemptId/result` | Yes | Get an attempt result |

### Analytics

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/analytics/dashboard` | Yes | Get dashboard analytics |
| GET | `/analytics/events/:eventId` | Yes | Get analytics for one event |

## Request field reference

The following request fields come from the current Zod schemas in `src/schemas/`. Unless noted otherwise, object schemas are strict: unknown fields are rejected. Fields described as optional may be omitted; nullable fields may explicitly be sent as `null` where the schema allows it. Date values should be sent as ISO-8601 strings in JSON.

### Authentication

**POST `/auth/signup`**

| Field | Type | Requirement / constraints |
|---|---|---|
| `fullName` | string | Required; 1–120 characters |
| `email` | string | Required; valid email, max 254 characters |
| `password` | string | Required; 8–128 characters |
| `mobileNumber` | string | Optional; 7–20 characters |
| `role` | string | Optional; `attendee` or `organiser`; defaults to `attendee` |
| `designation` | string | Optional; max 120 characters |
| `organization` | string | Optional; max 160 characters |

**POST `/auth/login`**

| Field | Type | Requirement / constraints |
|---|---|---|
| `email` | string | Required; valid email, max 254 characters |
| `password` | string | Required; 1–128 characters |

### User profile

**PATCH `/users/profile`** — send at least one field:

| Field | Type | Requirement / constraints |
|---|---|---|
| `fullName` | string | Optional; 1–120 characters |
| `mobileNumber` | string | Optional; 7–20 characters |
| `designation` | string or null | Optional; max 120 characters |
| `organization` | string or null | Optional; max 160 characters |
| `profileImagePath` | string or null | Optional; max 1000 characters |
| `about` | string or null | Optional; max 3000 characters |
| `interests` | string or null | Optional; max 2000 characters (schema currently expects a string, not an array) |

### Organiser profile

**POST/PATCH `/organisers/profile`** — all fields are optional in the schema; create/update accepts:

| Field | Type | Constraint |
|---|---|---|
| `organisationName` | string or null | Max 160 characters |
| `organiserType` | string or null | Max 100 characters |
| `designation` | string or null | Max 120 characters |
| `description` | string or null | Max 3000 characters |

The PATCH schema requires at least one field.

### Events

**POST/PATCH `/events` and `/events/:eventId`** — create requires the non-optional fields below; PATCH accepts a partial event object but requires at least one field.

| Field | Type | Requirement / constraints |
|---|---|---|
| `eventName` | string | Required on create; 1–200 characters |
| `description` | string | Required on create; 1–10000 characters |
| `category` | string | Required on create; 1–100 characters |
| `bannerPath` | string or null | Optional; max 1000 characters |
| `eventFormat` | string | Required on create; 1–50 characters |
| `startDate` | date | Required on create |
| `endDate` | date | Required on create; must not be before `startDate` |
| `startTime` | string or null | Optional; max 30 characters |
| `endTime` | string or null | Optional; max 30 characters |
| `venueName` | string | Required on create; 1–200 characters |
| `address` | string or null | Optional; max 500 characters |
| `city` | string or null | Optional; max 120 characters |
| `country` | string or null | Optional; max 120 characters |
| `onlineMeetingUrl` | URL or null | Optional; must be a valid URL when supplied |
| `platformName` | string or null | Optional; max 100 characters |
| `visibility` | string | `public` or `private`; defaults to `public` |
| `accessCode` | string or null | Optional; max 100 characters |
| `registrationDeadline` | date or null | Optional |
| `maximumCapacity` | integer | 1–1,000,000; defaults to 500 |
| `registrationOpen` | boolean | Defaults to `true` |
| `approvalRequired` | boolean | Defaults to `false` |
| `waitlistEnabled` | boolean | Defaults to `false` |
| `eventStatus` | string | 1–50 characters; defaults to `published` |

### Agenda days

**POST `/events/:eventId/agenda` and PATCH `/agenda/:agendaDayId`**

| Field | Type | Requirement / constraints |
|---|---|---|
| `title` | string | Required on create; 1–160 characters |
| `agendaDate` | date | Required on create |
| `sortOrder` | integer | Optional; minimum 0; defaults to 0 |

PATCH requires at least one field.

### Sessions

**POST `/events/:eventId/sessions` and PATCH `/sessions/:sessionId`**

| Field | Type | Requirement / constraints |
|---|---|---|
| `agendaDayId` | string or null | Optional |
| `title` | string | Required on create; 1–200 characters |
| `description` | string or null | Optional; max 3000 characters |
| `activityType` | string | 1–80 characters; defaults to `Keynote` |
| `speakerName` | string or null | Optional; max 160 characters |
| `locationName` | string or null | Optional; max 160 characters |
| `startTime` | string | Required on create; 1–30 characters |
| `endTime` | string | Required on create; 1–30 characters |
| `sessionDate` | date | Required on create |

PATCH requires at least one field. **PATCH `/sessions/:sessionId/favorite`** accepts `{ "isFavorite": boolean }`.

### Locations

**POST `/events/:eventId/locations` and PATCH `/locations/:locationId`**

| Field | Type | Requirement / constraints |
|---|---|---|
| `name` | string | Required on create; 1–160 characters |
| `building` | string or null | Optional; max 160 characters |
| `floor` | string or null | Optional; max 40 characters |
| `roomNumber` | string or null | Optional; max 40 characters |
| `capacity` | integer or null | Optional; positive when supplied |
| `description` | string or null | Optional; max 2000 characters |
| `latitude` | number or null | Optional; -90 to 90 |
| `longitude` | number or null | Optional; -180 to 180 |
| `locationType` | string or null | Optional; max 80 characters |

PATCH requires at least one field.

### Speakers

**POST `/events/:eventId/speakers` and PATCH `/speakers/:speakerId`**

| Field | Type | Requirement / constraints |
|---|---|---|
| `name` | string | Required on create; 1–160 characters |
| `designation` | string or null | Optional; max 120 characters |
| `organization` | string or null | Optional; max 160 characters |
| `biography` | string or null | Optional; max 5000 characters |
| `profileImagePath` | string or null | Optional; max 1000 characters |
| `topic` | string or null | Optional; max 300 characters |
| `email` | email or null | Optional; valid email when supplied |
| `contactInformation` | string or null | Optional; max 500 characters |

PATCH requires at least one field.

### Registrations and check-in

| Endpoint | Request body |
|---|---|
| `POST /events/:eventId/registrations` | `{ "eventId": "..." }` — required by `createRegistrationSchema`; note the route also contains `:eventId` in the URL |
| `PATCH /registrations/:registrationId/cancel` | `{ "reason": "..." }` — optional string, max 1000 characters; an empty object is allowed |
| `PATCH /registrations/:registrationId/review` | `{ "approvalStatus": "approved" }`; allowed values: `approved`, `rejected`, `pending` |
| `POST /events/:eventId/check-in` | `{ "qrToken": "..." }` — required string, 1–500 characters |

`GET /events/:eventId/registrations` and `GET /events/:eventId/check-ins` do not define request-body schemas.

### Invitations

| Endpoint | Request body |
|---|---|
| `POST /events/:eventId/invitations` | `{ "emails": ["person@example.com"], "expiresAt": "2026-12-01T00:00:00.000Z" }`; `emails` is required (1–500 valid email addresses), `expiresAt` is optional and nullable |
| `POST /invitations/validate` | `{ "invitationCode": "..." }`; required string, 1–200 characters |

The GET invitations endpoint has no request-body schema.

### Feedback

**POST `/events/:eventId/feedback`** accepts:

| Field | Type | Requirement / constraints |
|---|---|---|
| `eventId` | string | Required, non-empty |
| `rating` | number | Required; 1–5 |
| `comments` | string or null | Optional; max 5000 characters |

### FAQs

**POST `/faqs` and PATCH `/faqs/:faqId`**

| Field | Type | Requirement / constraints |
|---|---|---|
| `eventId` | string or null | Optional |
| `question` | string | Required on create; 1–1000 characters |
| `answer` | string | Required on create; 1–5000 characters |
| `category` | string | 1–100 characters; defaults to `General` |
| `sortOrder` | integer | Minimum 0; defaults to 0 |
| `status` | string | 1–50 characters; defaults to `published` |

PATCH requires at least one field.

### Notifications

**POST `/notifications`** accepts `eventId` (optional string or null), `title` (required, 1–200 characters), `message` (required, 1–5000 characters), and `isPinned` (optional boolean, default `false`).

**PATCH `/notifications/:notificationId`** accepts one of the following strict body shapes:

```json
{ "isRead": true }
```

or

```json
{ "isPinned": true }
```

### Favourites

**POST `/favorites`** accepts:

```json
{ "itemType": "session", "itemId": "item-id" }
```

Both fields are required non-empty strings; `itemType` has a maximum length of 50 characters. Removal uses `DELETE /favorites/:itemType/:itemId`.

### Help-desk contacts

**POST `/events/:eventId/help-desk` and PATCH `/help-desk/:contactId`**

| Field | Type | Requirement / constraints |
|---|---|---|
| `title` | string | Required on create; 1–160 characters |
| `description` | string or null | Optional; max 2000 characters |
| `contactType` | string | 1–100 characters; defaults to `General Support` |
| `email` | email or null | Optional; valid email when supplied |
| `phone` | string or null | Optional; 7–20 characters |
| `location` | string or null | Optional; max 300 characters |
| `operatingHours` | string or null | Optional; max 160 characters |
| `displayOrder` | integer | Minimum 0; defaults to 0 |
| `isEnabled` | boolean | Defaults to `true` |
| `isPublished` | boolean | Defaults to `true` |

PATCH requires at least one field.

### Support inquiries

**POST `/events/:eventId/support-inquiries`** accepts:

| Field | Type | Requirement / constraints |
|---|---|---|
| `eventId` | string | Required, non-empty |
| `subject` | string | Required; 1–200 characters |
| `description` | string | Required; 1–5000 characters |
| `category` | string | 1–100 characters; defaults to `General Inquiry` |
| `priority` | string | `low`, `normal`, `high`, or `urgent`; defaults to `normal` |

**PATCH `/support-inquiries/:inquiryId`** accepts one or more of:

| Field | Type | Allowed values / constraints |
|---|---|---|
| `status` | string | `new`, `in_progress`, `resolved`, `closed` |
| `priority` | string | `low`, `normal`, `high`, `urgent` |
| `organiserResponse` | string or null | Max 5000 characters |
| `internalNote` | string or null | Max 5000 characters |

At least one field is required. The schema permits `internalNote`; response visibility is controlled by the service/controller implementation.

### Quizzes

**POST `/quizzes`** creates a quiz and its questions in one request.

Quiz fields:

| Field | Type | Requirement / constraints |
|---|---|---|
| `eventId` | string | Required, non-empty |
| `agendaId` | string or null | Optional; refers to a session/agenda item in the database relation |
| `title` | string | Required; 1–200 characters |
| `description` | string | Required; 1–3000 characters |
| `instructions` | string | Required; 1–5000 characters |
| `quizType` | string | Required; 1–80 characters |
| `difficulty` | string | Required; 1–50 characters |
| `passingPercentage` | number | 0–100; defaults to 50 |
| `durationMinutes` | integer | 1–1440; defaults to 15 |
| `maxAttempts` | integer | 1–100; defaults to 1 |
| `availabilityMode` | string | 1–50 characters; defaults to `manual` |
| `startAt` | date or null | Optional |
| `endAt` | date or null | Optional; must be after `startAt` when both are supplied |
| `status` | string | 1–50 characters; defaults to `draft` |
| `isEnabled` | boolean | Defaults to `true` |
| `resultVisibility` | string | 1–80 characters; defaults to `hidden_until_released` |
| `questions` | array | Required; 1–200 question objects |

Each question object:

| Field | Type | Requirement / constraints |
|---|---|---|
| `questionText` | string | Required; 1–3000 characters |
| `questionType` | string | Required; 1–80 characters |
| `options` | string array | Defaults to `[]`; each option 1–500 characters |
| `correctAnswer` | any JSON value | Required; validated as `unknown` by Zod |
| `marks` | integer | Positive; defaults to 1 |
| `allowPartialMarks` | boolean | Defaults to `false` |
| `explanation` | string or null | Optional; max 2000 characters |
| `imageUrl` | URL or null | Optional; must be a valid URL when supplied |
| `sortOrder` | integer | Minimum 0; defaults to 0 |

**PATCH `/quizzes/:quizId` is not registered in the current routes.** The current `quiz.schema.ts` defines `updateQuizSchema`, but there is no corresponding PATCH route in `src/routes/index.ts`.

**POST `/quizzes/:quizId/attempts`** starts an attempt. Its schema accepts `{ "quizId": "..." }`.

**POST `/quiz-attempts/:attemptId/submit`** accepts:

```json
{
  "answers": [
    { "questionId": "question-id", "selectedAnswer": "option-value" }
  ]
}
```

`answers` is required and may contain up to 200 entries. Each entry requires a non-empty `questionId`; `selectedAnswer` may be any JSON value.

### Common validation utilities

The common schema module also defines reusable validation rules:

- IDs: trimmed, non-empty strings.
- Email: trimmed valid email, max 254 characters.
- Phone: trimmed string, 7–20 characters.
- Pagination: `page` defaults to 1; `limit` defaults to 20 and is limited to 1–100.
- Date: coerced to a JavaScript `Date`.
- Required text: trimmed non-empty string with a configurable maximum length.
- Optional text: nullable optional string with a configurable maximum length.

Not every common utility is currently attached to a route query schema. The endpoint catalogue above reflects registered routes, not assumed pagination/filter support.

## Database schema

The Prisma schema uses SQLite and defines **20 models**. Prisma field names are camelCase; many database columns are mapped to snake_case with `@map`. `?` means nullable. Defaults and uniqueness constraints are shown where declared in `schema.prisma`.

### 1. `User` — `users`

| Field | Type | Notes |
|---|---|---|
| `id` | String | Primary key |
| `fullName` | String | Maps to `full_name` |
| `email` | String | Unique |
| `mobileNumber` | String? | `mobile_number` |
| `passwordHash` | String | `password_hash`; bcrypt hash |
| `role` | String | Role value stored as string |
| `designation` | String? | |
| `organization` | String? | |
| `profileImagePath` | String? | `profile_image_path` |
| `about` | String? | |
| `interests` | String? | Stored as string |
| `createdAt` | DateTime | `created_at` |
| `updatedAt` | DateTime? | `updated_at` |
| `isActive` | Boolean | Default `true`; `is_active` |
| `tenantId` | String | Default `default`; `tenant_id`; indexed |

### 2. `OrganiserProfile` — `organiser_profiles`

`id` (String, primary key), `userId` (String, `user_id`), `organisationName` (String?, `organisation_name`), `organiserType` (String?, `organiser_type`), `designation` (String?), `description` (String?), `createdAt` (DateTime, `created_at`), `updatedAt` (DateTime?, `updated_at`). `userId` references `User.id` with cascade delete.

### 3. `Event` — `events`

| Field | Type | Notes |
|---|---|---|
| `id` | String | Primary key |
| `organiserId` | String | `organiser_id`; FK to `User.id` |
| `organiserName` | String | `organiser_name`; default `Event Organiser` |
| `eventName` | String | `event_name` |
| `description` | String | |
| `category` | String | |
| `bannerPath` | String? | `banner_path` |
| `eventFormat` | String | `event_format` |
| `startDate` | DateTime | `start_date` |
| `endDate` | DateTime | `end_date` |
| `startTime` | String? | `start_time` |
| `endTime` | String? | `end_time` |
| `venueName` | String | `venue_name` |
| `address` | String? | |
| `city` | String? | |
| `country` | String? | |
| `onlineMeetingUrl` | String? | `online_meeting_url` |
| `platformName` | String? | `platform_name` |
| `visibility` | String | Default `public` |
| `accessCode` | String? | `access_code` |
| `accessCodeHash` | String? | `access_code_hash` |
| `registrationDeadline` | DateTime? | `registration_deadline` |
| `maximumCapacity` | Int | Default 500; `maximum_capacity` |
| `attendeeCount` | Int | Default 0; `attendee_count` |
| `registrationOpen` | Boolean | Default true; `registration_open` |
| `approvalRequired` | Boolean | Default false; `approval_required` |
| `waitlistEnabled` | Boolean | Default false; `waitlist_enabled` |
| `eventStatus` | String | Default `published`; `event_status` |
| `tenantId` | String | Default `default`; `tenant_id`; indexed |
| `createdAt` | DateTime | `created_at` |
| `updatedAt` | DateTime? | `updated_at` |

### 4. `AgendaDay` — `agenda_days`

`id` (String, primary key), `eventId` (String, `event_id`, FK to Event), `title` (String), `agendaDate` (DateTime, `agenda_date`), `sortOrder` (Int, default 0, `sort_order`). Event deletion cascades.

### 5. `Session` — `sessions`

`id` (String, primary key), `eventId` (String, `event_id`, FK to Event), `agendaDayId` (String?, `agenda_day_id`, optional FK to AgendaDay), `title` (String), `description` (String?), `activityType` (String, default `Keynote`, `activity_type`), `speakerName` (String?, `speaker_name`), `locationName` (String?, `location_name`), `startTime` (String, `start_time`), `endTime` (String, `end_time`), `sessionDate` (DateTime, `session_date`), `isFavorite` (Boolean, default false, `is_favorite`), `createdAt` (DateTime, `created_at`), `updatedAt` (DateTime?, `updated_at`). Event deletion cascades; deleting an agenda day cascades to its linked sessions.

### 6. `Location` — `locations`

`id` (String, primary key), `eventId` (String, `event_id`, FK to Event), `name` (String), `building` (String?), `floor` (String?), `roomNumber` (String?, `room_number`), `capacity` (Int?), `description` (String?), `latitude` (Float?), `longitude` (Float?), `locationType` (String?, `location_type`). Event deletion cascades.

### 7. `Speaker` — `speakers`

`id` (String, primary key), `eventId` (String, `event_id`, FK to Event), `name` (String), `designation` (String?), `organization` (String?), `biography` (String?), `profileImagePath` (String?, `profile_image_path`), `topic` (String?), `email` (String?), `contactInformation` (String?, `contact_information`), `createdAt` (DateTime?, `created_at`), `updatedAt` (DateTime?, `updated_at`). `eventId` is indexed. Event deletion cascades.

### 8. `Registration` — `registrations`

`id` (String, primary key), `eventId` (String, `event_id`, FK to Event), `attendeeId` (String, `attendee_id`, FK to User), `eventTitle` (String, `event_title`), `attendeeName` (String, `attendee_name`), `attendeeEmail` (String, `attendee_email`), `qrToken` (String, unique, `qr_token`), `registrationStatus` (String, default `confirmed`, `registration_status`), `approvalStatus` (String, default `approved`, `approval_status`), `isCheckedIn` (Boolean, default false, `is_checked_in`), `checkInTime` (DateTime?, `check_in_time`), `registeredAt` (DateTime, `registered_at`), `cancellationDate` (DateTime?, `cancellation_date`), `tenantId` (String, default `default`, `tenant_id`, indexed). Composite unique constraint: `(eventId, attendeeId)`.

### 9. `CheckIn` — `check_ins`

`id` (String, primary key), `eventId` (String, `event_id`, FK to Event), `registrationId` (String, unique, `registration_id`, FK to Registration), `attendeeId` (String, `attendee_id`, FK to User), `checkInTime` (DateTime, `check_in_time`), `checkedInBy` (String, `checked_in_by`). Related event, registration and attendee deletions cascade.

### 10. `Invitation` — `invitations`

`id` (String, primary key), `eventId` (String, `event_id`, FK to Event), `email` (String), `invitationCode` (String, `invitation_code`), `invitationStatus` (String, default `sent`, `invitation_status`), `createdAt` (DateTime, `created_at`), `expiresAt` (DateTime?, `expires_at`). Event deletion cascades.

### 11. `FeedbackSubmission` — `feedback_submissions`

`id` (String, primary key), `tenantId` (String, default `default`, `tenant_id`, indexed), `eventId` (String, `event_id`, FK to Event), `attendeeId` (String, `attendee_id`, FK to User), `attendeeName` (String, `attendee_name`), `attendeeEmail` (String?, `attendee_email`), `rating` (Float), `comments` (String?), `submittedAt` (DateTime, `submitted_at`). Composite unique constraint: `(eventId, attendeeId)`.

### 12. `Faq` — `faqs`

`id` (String, primary key), `eventId` (String?, `event_id`, optional FK to Event), `question` (String), `answer` (String), `category` (String, default `General`), `sortOrder` (Int, default 0, `sort_order`), `status` (String, default `published`), `createdAt` (DateTime?, `created_at`), `updatedAt` (DateTime?, `updated_at`). Index: `(eventId, status)`.

### 13. `Notification` — `notifications`

`id` (String, primary key), `eventId` (String?, `event_id`, optional FK to Event), `title` (String), `message` (String), `timestamp` (DateTime), `isRead` (Boolean, default false, `is_read`), `isPinned` (Boolean, default false, `is_pinned`).

### 14. `Favorite` — `favorites`

`id` (String, primary key), `userId` (String, `user_id`, FK to User), `itemType` (String, `item_type`), `itemId` (String, `item_id`), `addedAt` (DateTime, `added_at`). Composite unique constraint: `(userId, itemType, itemId)`.

### 15. `EventHelpDeskContact` — `event_help_desk_contacts`

`id` (String, primary key), `eventId` (String, `event_id`, FK to Event), `title` (String), `description` (String?), `contactType` (String, default `General Support`, `contact_type`), `email` (String?), `phone` (String?), `location` (String?), `operatingHours` (String?, `operating_hours`), `displayOrder` (Int, default 0, `display_order`), `isEnabled` (Boolean, default true, `is_enabled`), `isPublished` (Boolean, default true, `is_published`), `createdAt` (DateTime?, `created_at`), `updatedAt` (DateTime?, `updated_at`). Index: `(eventId, isPublished, isEnabled)`.

### 16. `EventSupportInquiry` — `event_support_inquiries`

`id` (String, primary key), `eventId` (String, `event_id`, FK to Event), `attendeeId` (String, `attendee_id`, FK to User), `attendeeName` (String, `attendee_name`), `attendeeEmail` (String, `attendee_email`), `subject` (String), `description` (String), `category` (String, default `General Inquiry`), `status` (String, default `new`), `priority` (String, default `normal`), `organiserResponse` (String?, `organiser_response`), `internalNote` (String?, `internal_note`), `submittedAt` (DateTime, `submitted_at`), `updatedAt` (DateTime?, `updated_at`), `resolvedAt` (DateTime?, `resolved_at`). Indexes: `(eventId, status)` and `attendeeId`.

### 17. `Quiz` — `quizzes`

`id` (String, primary key), `tenantId` (String, default `default`, `tenant_id`, indexed), `eventId` (String, `event_id`, FK to Event), `agendaId` (String?, `agenda_id`, optional FK to Session), `title` (String), `description` (String), `instructions` (String), `quizType` (String, `quiz_type`), `difficulty` (String), `totalQuestions` (Int, default 0, `total_questions`), `totalMarks` (Int, default 0, `total_marks`), `passingPercentage` (Float, default 50.0, `passing_percentage`), `durationMinutes` (Int, default 15, `duration_minutes`), `maxAttempts` (Int, default 1, `max_attempts`), `availabilityMode` (String, default `manual`, `availability_mode`), `startAt` (DateTime?, `start_at`), `endAt` (DateTime?, `end_at`), `status` (String, default `draft`), `isEnabled` (Boolean, default true, `is_enabled`), `resultVisibility` (String, default `hidden_until_released`, `result_visibility`), `areAnswersReleased` (Boolean, default false, `are_answers_released`), `createdBy` (String, `created_by`), `createdAt` (DateTime, `created_at`), `updatedAt` (DateTime?, `updated_at`). Indexes: `(eventId, status)`, `tenantId`, `(eventId, agendaId)`.

### 18. `QuizQuestion` — `quiz_questions`

`id` (String, primary key), `quizId` (String, `quiz_id`, FK to Quiz), `questionText` (String, `question_text`), `questionType` (String, `question_type`), `optionsJson` (String, `options_json`), `correctAnswerJson` (String, `correct_answer_json`), `marks` (Int, default 1), `allowPartialMarks` (Boolean, default false, `allow_partial_marks`), `explanation` (String?), `imageUrl` (String?, `image_url`), `sortOrder` (Int, default 0, `sort_order`). Index: `(quizId, sortOrder)`. Quiz deletion cascades.

### 19. `QuizAttempt` — `quiz_attempts`

`id` (String, primary key), `tenantId` (String, default `default`, `tenant_id`), `eventId` (String, `event_id`), `quizId` (String, `quiz_id`, FK to Quiz), `agendaId` (String?, `agenda_id`), `attendeeId` (String, `attendee_id`, FK to User), `attendeeName` (String, `attendee_name`), `attendeeEmail` (String, `attendee_email`), `attemptNumber` (Int, default 1, `attempt_number`), `startedAt` (DateTime, `started_at`), `submittedAt` (DateTime?, `submitted_at`), `status` (String, default `in_progress`), `score` (Float, default 0.0), `totalMarks` (Int, default 0, `total_marks`), `percentage` (Float, default 0.0), `correctAnswers` (Int, default 0, `correct_answers`), `incorrectAnswers` (Int, default 0, `incorrect_answers`), `unansweredQuestions` (Int, default 0, `unanswered_questions`), `timeTakenSeconds` (Int, default 0, `time_taken_seconds`), `result` (String, default `pending`). Indexes: `(quizId, attendeeId)` and `(tenantId, eventId)`.

### 20. `QuizAnswer` — `quiz_answers`

`id` (String, primary key), `attemptId` (String, `attempt_id`, FK to QuizAttempt), `questionId` (String, `question_id`), `selectedAnswerJson` (String, `selected_answer_json`), `isCorrect` (Boolean, default false, `is_correct`), `marksObtained` (Float, default 0.0, `marks_obtained`), `answeredAt` (DateTime, `answered_at`). Index: `attemptId`. Attempt deletion cascades.

## Validation and error responses

Request validation is implemented with Zod. The global error handler returns JSON responses in these shapes.

Validation error (`400`):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Enter a valid email address" }
  ]
}
```

Application or server error:

```json
{
  "success": false,
  "message": "Error message"
}
```

For errors with status codes 500 or higher, the global handler returns the generic message `Internal server error`. Unknown routes return `404` with `success: false` and a route-not-found message.

Successful controllers generally return a `success` flag, a `message`, and/or a `data` property. Refer to the relevant controller/service for the exact response payload of each endpoint.

## Flutter Android emulator connection

When the backend is running on the development machine at port `5000`, the Android emulator reaches the host machine using `10.0.2.2`:

```dart
const apiBaseUrl = 'http://10.0.2.2:5000/api';
const healthUrl = 'http://10.0.2.2:5000/health';
```

`localhost` inside the Android emulator refers to the emulator itself, not the development computer. The `10.0.2.2` address is for the standard Android Studio emulator; a physical Android device needs the computer's reachable LAN IP and suitable network/firewall configuration. For production, use HTTPS and the deployed API hostname.

## Current limitations and integration notes

These notes are based on the current source code and route/schema registration:

1. **Signup does not return an access token.** The signup controller returns the created user's basic details. The client must call login after signup if it needs a JWT immediately.
2. **No `/auth/me`, logout, refresh-token or OTP route is registered.** Do not build client calls to these paths until they are implemented.
3. **Login accepts only `email` and `password`.** `expectedRole` and `expectedTenantId` are not part of the current login Zod schema.
4. **Signup currently assigns tenant ID `default`.** There is no tenant-selection field in the signup schema.
5. **No email delivery provider is configured in this source.** Invitation records can be created, but the route itself does not imply that an email is sent.
6. **No file-upload route is registered.** Event banners, speaker images and profile images are represented by path/URL-like string fields; an upload service is not defined by the listed routes.
7. **Notifications are stored with `isRead` on the notification record itself.** The schema does not define a per-user notification-recipient/read-state join table.
8. **`QuizQuestion.correctAnswerJson` is persisted in the database.** The quiz service/controller must control which fields are returned to attendees; never expose correct answers before the configured release policy permits it.
9. **The current route table uses `/api` as its prefix.** Older endpoint notes that use `/api/v1`, `/content/...`, or `/registrations/...` are not the route paths registered in this project.
10. **The project currently uses SQLite.** A move to PostgreSQL or a multi-instance production deployment requires a deliberate Prisma datasource/migration and deployment change.
11. **`CORS_ORIGIN` is validated but not passed into `cors()` in `app.ts`.** Configure the middleware before relying on that variable for a production origin allow-list.
12. **Request schemas are strict.** Flutter request DTOs must use the exact field names shown above; extra fields can cause validation failures.

## Production checklist

- Set `NODE_ENV=production`.
- Generate a strong random `JWT_SECRET` of at least 32 characters and store it securely.
- Configure a restrictive CORS allow-list in `app.ts` before deployment; the current environment variable is not wired into the middleware.
- Deploy behind HTTPS.
- Restrict database and environment-file access; never commit `.env` or database secrets.
- Configure automated database backups and a restore procedure.
- Add rate limiting and abuse protection to public authentication and invitation endpoints before exposing the API publicly.
- Verify tenant isolation and role/ownership authorization for every protected workflow.
- Run integration checks against the exact Flutter request and response DTOs before release.
