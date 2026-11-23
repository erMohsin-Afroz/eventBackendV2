# Event Organise Backend

A structured REST backend for the Event Organise Flutter application.

## Stack

- Node.js + Express 5
- TypeScript 5.9
- Prisma ORM 6.19
- SQLite
- Zod 4 request validation
- JWT authentication and bcrypt password hashing
- Swagger UI / OpenAPI 3

## Important source-of-truth note

The Prisma schema is based on the 20 Drift tables in the Flutter project's `lib/core/database/database_tables.dart`. Table/column names (including Drift snake_case SQL column names via Prisma `@map`), nullability, defaults, primary keys, unique constraints, and declared foreign keys are kept aligned with that source. The API adds server-side authorization and transaction handling where the Flutter app previously relied on local-only logic. Every camelCase Prisma scalar field is mapped to Drift’s generated snake_case SQLite column name.

The Flutter model layer does not persist every model property. For example, `accessInstructions` and `invitedEmails` are not columns in the local `events` table. They are intentionally not added to the database schema. The backend also does not expose the admin or OTP flows, as requested.

## Requirements

- Node.js 22 LTS recommended. Prisma 6.19.3 is pinned in this project.
- npm

## Setup

1. Extract this folder.
2. Copy `.env.example` to `.env`.
3. Keep `DATABASE_URL="file:./dev.db"` for the included Prisma schema. Prisma resolves this relative to the `prisma` folder.
4. Install packages:

   ```bash
   npm install
   ```

5. Generate Prisma Client:

   ```bash
   npm run db:generate
   ```

6. Create and apply the initial migration:

   ```bash
   npm run db:migrate -- --name init
   ```

7. Start development server:

   ```bash
   npm run dev
   ```

8. Open:
   - Health: http://localhost:5000/health
   - Swagger: http://localhost:5000/api-docs

## Scripts

- `npm run dev` — start with tsx watch
- `npm run typecheck` — TypeScript check
- `npm run build` — compile to `dist`
- `npm start` — run compiled server
- `npm run db:generate` — generate Prisma Client
- `npm run db:migrate -- --name <migration-name>` — create/apply migration
- `npm run db:studio` — open Prisma Studio

## Authentication

Signup and login return a JWT access token. Send it on protected endpoints:

```http
Authorization: Bearer <token>
```

Signup accepts `attendee` or `organiser`. Admin and OTP endpoints are deliberately excluded. Passwords are hashed with bcrypt; plaintext passwords are never stored.

## API route overview

Base URL: `/api/v1`

### Authentication

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/me`

### Events

- `GET /events` — public event discovery;
- `GET /events/mine` — organiser event dashboard; supports `page`, `limit`, `category`, `city`, `search`, `tenantId`
- `GET /events/mine` — organiser event dashboard
- `POST /events` — organiser creates event
- `GET /events/:id`
- `PATCH /events/:id` — organiser updates own event
- `DELETE /events/:id` — organiser deletes own event
- `GET /events/:id/registrations` — organiser roster
- `GET /events/:id/analytics` — registration, check-in, waitlist and feedback summary

### Invitations

- `POST /invitations/events/:eventId/invitations` — organiser creates an invitation record
- `GET /invitations/events/:eventId/invitations` — organiser invitation list
- `POST /invitations/accept` — signed-in invited attendee accepts with invitation code

Invitation records are stored, but email delivery is not configured.

### Registration and check-in

- `POST /registrations/events/:eventId/register`
- `GET /registrations/me`
- `PATCH /registrations/:registrationId/cancel`
- `PATCH /registrations/:registrationId/approval` — body `{ "approvalStatus": "approved" | "rejected" }`
- `POST /registrations/check-in` — body `{ "qrToken": "..." }`
- `POST /registrations/check-in/manual` — body `{ "eventId": "...", "attendeeEmail": "..." }`

Registration capacity checks, approval status, waitlisting, cancellation promotion, attendee count reconciliation and duplicate check-in checks are handled on the server. These operations use database transactions.

### Event content and engagement

- `GET /content/events/:eventId/agenda`
- `POST /content/events/:eventId/agenda/days`
- `POST /content/events/:eventId/sessions`
- `GET /content/events/:eventId/speakers`
- `POST /content/events/:eventId/speakers`
- `GET /content/events/:eventId/locations`
- `POST /content/events/:eventId/locations`
- `GET /content/events/:eventId/faqs`
- `POST /content/events/:eventId/faqs`
- `PATCH /content/faqs/:faqId`
- `DELETE /content/faqs/:faqId`
- `GET /content/events/:eventId/help-desk`
- `POST /content/events/:eventId/help-desk`
- `POST /content/events/:eventId/support-inquiries`
- `GET /content/events/:eventId/support-inquiries` — organiser
- `PATCH /content/support-inquiries/:inquiryId` — organiser
- `GET /content/notifications`
- `PATCH /content/notifications/:notificationId/read`
- `POST /content/notifications` — organiser announcement
- `GET /content/favorites`
- `POST /content/favorites`
- `DELETE /content/favorites/:itemType/:itemId`
- `POST /content/events/:eventId/feedback`

Support inquiry attendee responses do not include the organiser-only `internalNote` field.

### Quizzes

- `GET /quizzes/events/:eventId/quizzes`
- `POST /quizzes/events/:eventId/quizzes` — organiser
- `POST /quizzes/:quizId/questions` — organiser
- `POST /quizzes/:quizId/start` — attendee
- `POST /quizzes/attempts/:attemptId/submit` — attendee
- `GET /quizzes/attempts/:attemptId/result` — attempt owner or event organiser

Quiz scheduling, availability, attempt limits, active attempt resumption, answer secrecy, server-side scoring and result visibility are enforced by the API. Correct answers are never returned with the quiz question list.

## Important integration notes

1. The API is a REST service; the Flutter app's local repositories must be replaced/adapted to call these endpoints. The existing local Drift database is not automatically synchronized with this backend.
2. `notifications` in the Flutter schema has no recipient/read-per-user relationship. This API preserves that table structure, so notification read state is currently shared at record level. A future per-user notification design would require a deliberate database migration and Flutter changes.
3. `agenda_days` is represented as a table even though the current Flutter app can derive agenda days from session dates in some flows.
4. Invitations are represented in the schema, but no email delivery provider is configured. OTP and email verification are intentionally not implemented.
5. File uploads, push notifications, email delivery and PDF exports are not fabricated. Existing Flutter export screens that only show a success message need a separate export implementation if real files are required.
6. The original Flutter project has no attendee-to-attendee messaging backend; the Networking screen is a speaker directory.
7. Tenant IDs are taken from the authenticated JWT for protected writes. Public event discovery accepts a tenant filter for development; production deployments should resolve tenants from a trusted hostname/domain or public tenant identifier rather than trusting arbitrary client-supplied tenant IDs.

## Security and production checklist

- Replace `JWT_SECRET` with a cryptographically random secret.
- Set `CORS_ORIGIN` to the deployed Flutter web origin(s), if applicable.
- Use HTTPS in deployment.
- Add rate limiting and account lockout policy before public production launch.
- Configure backup/restore for the SQLite database; consider PostgreSQL for multi-instance/high-write production deployment.
- Add per-user notification delivery semantics if required by product behaviour.
- Run automated integration tests against the exact Flutter request/response contract before connecting the app.
