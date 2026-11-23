
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { OpenAPIV3 } from "openapi-types";

const swaggerDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",

  info: {
    title: "Event Organise API",
    version: "1.0.0",
    description:
      "API documentation for the Event Organise application.",
  },

  servers: [
    {
      url: "/api",
      description: "Current backend server",
    },
  ],

  tags: [
    { name: "Authentication" },
    { name: "Users" },
    { name: "Organisers" },
    { name: "Events" },
    { name: "Agenda" },
    { name: "Sessions" },
    { name: "Locations" },
    { name: "Speakers" },
    { name: "Registrations" },
    { name: "Check-in" },
    { name: "Invitations" },
    { name: "Feedback" },
    { name: "FAQs" },
    { name: "Notifications" },
    { name: "Favorites" },
    { name: "Help Desk" },
    { name: "Support Inquiries" },
    { name: "Quizzes" },
    { name: "Analytics" },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT access token.",
      },
    },

    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: {},
        },
      },

      SignupRequest: {
        type: "object",
        required: ["fullName", "email", "password", "role"],
        properties: {
          fullName: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
          role: {
            type: "string",
            enum: ["attendee", "organiser"],
          },
        },
      },

      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
      },

      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
        },
      },
    },
  },

  paths: {
    "/auth/signup": {
      post: {
        tags: ["Authentication"],
        summary: "Create a user account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SignupRequest",
              },
            },
          },
        },
        responses: {
          "201": { description: "Account created" },
          "400": { description: "Validation error" },
          "409": { description: "Email already registered" },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },
        responses: {
          "200": { description: "Login successful" },
          "401": { description: "Invalid credentials" },
        },
      },
    },

    "/users/profile": {
      get: {
        tags: ["Users"],
        summary: "Get logged-in user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "User profile" },
          "401": { description: "Unauthenticated" },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Profile updated" },
          "401": { description: "Unauthenticated" },
        },
      },
    },

    "/organisers/profile": {
      get: {
        tags: ["Organisers"],
        summary: "Get organiser profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Organiser profile" },
        },
      },
      post: {
        tags: ["Organisers"],
        summary: "Create organiser profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Profile created" },
        },
      },
      patch: {
        tags: ["Organisers"],
        summary: "Update organiser profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Profile updated" },
        },
      },
    },

    "/events": {
      get: {
        tags: ["Events"],
        summary: "Get published events",
        responses: {
          "200": { description: "Published events" },
        },
      },
      post: {
        tags: ["Events"],
        summary: "Create an event",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Event created" },
        },
      },
    },

    "/events/{eventId}": {
      get: {
        tags: ["Events"],
        summary: "Get event details",
        parameters: [
          {
            name: "eventId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Event details" },
          "404": { description: "Event not found" },
        },
      },
      patch: {
        tags: ["Events"],
        summary: "Update event",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "eventId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Event updated" },
        },
      },
      delete: {
        tags: ["Events"],
        summary: "Delete event",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "eventId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Event deleted" },
        },
      },
    },

    "/events/{eventId}/agenda": {
      get: {
        tags: ["Agenda"],
        summary: "Get event agenda",
        parameters: [
          {
            name: "eventId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Agenda days" },
        },
      },
      post: {
        tags: ["Agenda"],
        summary: "Create agenda day",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "eventId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "201": { description: "Agenda day created" },
        },
      },
    },

    "/events/{eventId}/sessions": {
      get: {
        tags: ["Sessions"],
        summary: "Get event sessions",
        parameters: [
          {
            name: "eventId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Event sessions" },
        },
      },
      post: {
        tags: ["Sessions"],
        summary: "Create a session",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Session created" },
        },
      },
    },

    "/events/{eventId}/registrations": {
      get: {
        tags: ["Registrations"],
        summary: "Get event registrations",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Registrations" },
        },
      },
      post: {
        tags: ["Registrations"],
        summary: "Register for an event",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Registration processed" },
        },
      },
    },

    "/events/{eventId}/check-in": {
      post: {
        tags: ["Check-in"],
        summary: "Check in an attendee using QR token",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Check-in successful" },
        },
      },
    },

    "/invitations/validate": {
      post: {
        tags: ["Invitations"],
        summary: "Validate an invitation code",
        responses: {
          "200": { description: "Invitation validation result" },
        },
      },
    },

    "/events/{eventId}/feedback": {
      get: {
        tags: ["Feedback"],
        summary: "Get event feedback",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Event feedback" },
        },
      },
      post: {
        tags: ["Feedback"],
        summary: "Submit event feedback",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Feedback submitted" },
        },
      },
    },

    "/faqs": {
      get: {
        tags: ["FAQs"],
        summary: "Get published FAQs",
        responses: {
          "200": { description: "Published FAQs" },
        },
      },
      post: {
        tags: ["FAQs"],
        summary: "Create FAQ",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "FAQ created" },
        },
      },
    },

    "/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get notifications",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Notifications" },
        },
      },
      post: {
        tags: ["Notifications"],
        summary: "Create notification",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Notification created" },
        },
      },
    },

    "/favorites": {
      get: {
        tags: ["Favorites"],
        summary: "Get user favorites",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Favorites" },
        },
      },
      post: {
        tags: ["Favorites"],
        summary: "Add favorite",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Favorite added" },
        },
      },
    },

    "/events/{eventId}/help-desk": {
      get: {
        tags: ["Help Desk"],
        summary: "Get published help desk contacts",
        responses: {
          "200": { description: "Help desk contacts" },
        },
      },
      post: {
        tags: ["Help Desk"],
        summary: "Create help desk contact",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Contact created" },
        },
      },
    },

    "/events/{eventId}/support-inquiries": {
      get: {
        tags: ["Support Inquiries"],
        summary: "Get event support inquiries",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Support inquiries" },
        },
      },
      post: {
        tags: ["Support Inquiries"],
        summary: "Submit support inquiry",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Inquiry submitted" },
        },
      },
    },

    "/events/{eventId}/quizzes": {
      get: {
        tags: ["Quizzes"],
        summary: "Get published event quizzes",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Published quizzes" },
        },
      },
    },

    "/quizzes": {
      post: {
        tags: ["Quizzes"],
        summary: "Create quiz",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Quiz created" },
        },
      },
    },

    "/quizzes/{quizId}/attempts": {
      post: {
        tags: ["Quizzes"],
        summary: "Start quiz attempt",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "quizId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "201": { description: "Attempt started" },
        },
      },
    },

    "/quiz-attempts/{attemptId}/submit": {
      post: {
        tags: ["Quizzes"],
        summary: "Submit quiz attempt",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "attemptId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Quiz submitted" },
        },
      },
    },

    "/analytics/dashboard": {
      get: {
        tags: ["Analytics"],
        summary: "Get organiser dashboard analytics",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Dashboard analytics" },
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument),
  );
}
