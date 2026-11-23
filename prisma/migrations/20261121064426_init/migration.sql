-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile_number" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "designation" TEXT,
    "organization" TEXT,
    "profile_image_path" TEXT,
    "about" TEXT,
    "interests" TEXT,
    "created_at" DATETIME NOT NULL,
    "updated_at" DATETIME,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" TEXT NOT NULL DEFAULT 'default'
);

-- CreateTable
CREATE TABLE "organiser_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "organisation_name" TEXT,
    "organiser_type" TEXT,
    "designation" TEXT,
    "description" TEXT,
    "created_at" DATETIME NOT NULL,
    "updated_at" DATETIME,
    CONSTRAINT "organiser_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organiser_id" TEXT NOT NULL,
    "organiser_name" TEXT NOT NULL DEFAULT 'Event Organiser',
    "event_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "banner_path" TEXT,
    "event_format" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,
    "venue_name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "online_meeting_url" TEXT,
    "platform_name" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "access_code" TEXT,
    "access_code_hash" TEXT,
    "registration_deadline" DATETIME,
    "maximum_capacity" INTEGER NOT NULL DEFAULT 500,
    "attendee_count" INTEGER NOT NULL DEFAULT 0,
    "registration_open" BOOLEAN NOT NULL DEFAULT true,
    "approval_required" BOOLEAN NOT NULL DEFAULT false,
    "waitlist_enabled" BOOLEAN NOT NULL DEFAULT false,
    "event_status" TEXT NOT NULL DEFAULT 'published',
    "tenant_id" TEXT NOT NULL DEFAULT 'default',
    "created_at" DATETIME NOT NULL,
    "updated_at" DATETIME,
    CONSTRAINT "events_organiser_id_fkey" FOREIGN KEY ("organiser_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agenda_days" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "agenda_date" DATETIME NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "agenda_days_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "agenda_day_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "activity_type" TEXT NOT NULL DEFAULT 'Keynote',
    "speaker_name" TEXT,
    "location_name" TEXT,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "session_date" DATETIME NOT NULL,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL,
    "updated_at" DATETIME,
    CONSTRAINT "sessions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sessions_agenda_day_id_fkey" FOREIGN KEY ("agenda_day_id") REFERENCES "agenda_days" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "building" TEXT,
    "floor" TEXT,
    "room_number" TEXT,
    "capacity" INTEGER,
    "description" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "location_type" TEXT,
    CONSTRAINT "locations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "speakers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "organization" TEXT,
    "biography" TEXT,
    "profile_image_path" TEXT,
    "topic" TEXT,
    "email" TEXT,
    "contact_information" TEXT,
    "created_at" DATETIME,
    "updated_at" DATETIME,
    CONSTRAINT "speakers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "attendee_id" TEXT NOT NULL,
    "event_title" TEXT NOT NULL,
    "attendee_name" TEXT NOT NULL,
    "attendee_email" TEXT NOT NULL,
    "qr_token" TEXT NOT NULL,
    "registration_status" TEXT NOT NULL DEFAULT 'confirmed',
    "approval_status" TEXT NOT NULL DEFAULT 'approved',
    "is_checked_in" BOOLEAN NOT NULL DEFAULT false,
    "check_in_time" DATETIME,
    "registered_at" DATETIME NOT NULL,
    "cancellation_date" DATETIME,
    "tenant_id" TEXT NOT NULL DEFAULT 'default',
    CONSTRAINT "registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "registrations_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "attendee_id" TEXT NOT NULL,
    "check_in_time" DATETIME NOT NULL,
    "checked_in_by" TEXT NOT NULL,
    CONSTRAINT "check_ins_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "check_ins_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "check_ins_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "invitation_code" TEXT NOT NULL,
    "invitation_status" TEXT NOT NULL DEFAULT 'sent',
    "created_at" DATETIME NOT NULL,
    "expires_at" DATETIME,
    CONSTRAINT "invitations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "feedback_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL DEFAULT 'default',
    "event_id" TEXT NOT NULL,
    "attendee_id" TEXT NOT NULL,
    "attendee_name" TEXT NOT NULL,
    "attendee_email" TEXT,
    "rating" REAL NOT NULL,
    "comments" TEXT,
    "submitted_at" DATETIME NOT NULL,
    CONSTRAINT "feedback_submissions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "feedback_submissions_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',
    "created_at" DATETIME,
    "updated_at" DATETIME,
    CONSTRAINT "faqs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "notifications_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "added_at" DATETIME NOT NULL,
    CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_help_desk_contacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contact_type" TEXT NOT NULL DEFAULT 'General Support',
    "email" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "operating_hours" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME,
    "updated_at" DATETIME,
    CONSTRAINT "event_help_desk_contacts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_support_inquiries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "attendee_id" TEXT NOT NULL,
    "attendee_name" TEXT NOT NULL,
    "attendee_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General Inquiry',
    "status" TEXT NOT NULL DEFAULT 'new',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "organiser_response" TEXT,
    "internal_note" TEXT,
    "submitted_at" DATETIME NOT NULL,
    "updated_at" DATETIME,
    "resolved_at" DATETIME,
    CONSTRAINT "event_support_inquiries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_support_inquiries_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL DEFAULT 'default',
    "event_id" TEXT NOT NULL,
    "agenda_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "quiz_type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "total_marks" INTEGER NOT NULL DEFAULT 0,
    "passing_percentage" REAL NOT NULL DEFAULT 50.0,
    "duration_minutes" INTEGER NOT NULL DEFAULT 15,
    "max_attempts" INTEGER NOT NULL DEFAULT 1,
    "availability_mode" TEXT NOT NULL DEFAULT 'manual',
    "start_at" DATETIME,
    "end_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "result_visibility" TEXT NOT NULL DEFAULT 'hidden_until_released',
    "are_answers_released" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL,
    "updated_at" DATETIME,
    CONSTRAINT "quizzes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "quizzes_agenda_id_fkey" FOREIGN KEY ("agenda_id") REFERENCES "sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quiz_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" TEXT NOT NULL,
    "options_json" TEXT NOT NULL,
    "correct_answer_json" TEXT NOT NULL,
    "marks" INTEGER NOT NULL DEFAULT 1,
    "allow_partial_marks" BOOLEAN NOT NULL DEFAULT false,
    "explanation" TEXT,
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL DEFAULT 'default',
    "event_id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "agenda_id" TEXT,
    "attendee_id" TEXT NOT NULL,
    "attendee_name" TEXT NOT NULL,
    "attendee_email" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "started_at" DATETIME NOT NULL,
    "submitted_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "score" REAL NOT NULL DEFAULT 0.0,
    "total_marks" INTEGER NOT NULL DEFAULT 0,
    "percentage" REAL NOT NULL DEFAULT 0.0,
    "correct_answers" INTEGER NOT NULL DEFAULT 0,
    "incorrect_answers" INTEGER NOT NULL DEFAULT 0,
    "unanswered_questions" INTEGER NOT NULL DEFAULT 0,
    "time_taken_seconds" INTEGER NOT NULL DEFAULT 0,
    "result" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "quiz_attempts_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_answer_json" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "marks_obtained" REAL NOT NULL DEFAULT 0.0,
    "answered_at" DATETIME NOT NULL,
    CONSTRAINT "quiz_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_tenant" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_events_tenant" ON "events"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_speakers_event" ON "speakers"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_qr_token_key" ON "registrations"("qr_token");

-- CreateIndex
CREATE INDEX "idx_registrations_tenant" ON "registrations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_event_id_attendee_id_key" ON "registrations"("event_id", "attendee_id");

-- CreateIndex
CREATE UNIQUE INDEX "check_ins_registration_id_key" ON "check_ins"("registration_id");

-- CreateIndex
CREATE INDEX "idx_feedback_tenant" ON "feedback_submissions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_feedback_event_attendee" ON "feedback_submissions"("event_id", "attendee_id");

-- CreateIndex
CREATE INDEX "idx_faqs_event_status" ON "faqs"("event_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_item_type_item_id_key" ON "favorites"("user_id", "item_type", "item_id");

-- CreateIndex
CREATE INDEX "idx_helpdesk_contacts_event" ON "event_help_desk_contacts"("event_id", "is_published", "is_enabled");

-- CreateIndex
CREATE INDEX "idx_support_inquiries_event" ON "event_support_inquiries"("event_id", "status");

-- CreateIndex
CREATE INDEX "idx_support_inquiries_attendee" ON "event_support_inquiries"("attendee_id");

-- CreateIndex
CREATE INDEX "idx_quizzes_event" ON "quizzes"("event_id", "status");

-- CreateIndex
CREATE INDEX "idx_quizzes_tenant" ON "quizzes"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_quizzes_agenda" ON "quizzes"("event_id", "agenda_id");

-- CreateIndex
CREATE INDEX "idx_quiz_questions_quiz" ON "quiz_questions"("quiz_id", "sort_order");

-- CreateIndex
CREATE INDEX "idx_quiz_attempts_quiz" ON "quiz_attempts"("quiz_id", "attendee_id");

-- CreateIndex
CREATE INDEX "idx_quiz_attempts_tenant" ON "quiz_attempts"("tenant_id", "event_id");

-- CreateIndex
CREATE INDEX "idx_quiz_answers_attempt" ON "quiz_answers"("attempt_id");
