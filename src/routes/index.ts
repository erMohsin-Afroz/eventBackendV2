
import { Router } from "express";


import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  signupSchema,
  loginSchema,
} from "../schemas/auth.schema.js";

import { authController } from "../controllers/auth.controller.js";
import { userController } from "../controllers/user.controller.js";
import { organiserController } from "../controllers/organiser.controller.js";
import { eventController } from "../controllers/event.controller.js";
import { agendaController } from "../controllers/agenda.controller.js";
import { sessionController } from "../controllers/session.controller.js";
import { locationController } from "../controllers/location.controller.js";
import { speakerController } from "../controllers/speaker.controller.js";
import { registrationController } from "../controllers/registration.controller.js";
import { checkInController } from "../controllers/check-in.controller.js";
import { invitationController } from "../controllers/invitation.controller.js";
import { feedbackController } from "../controllers/feedback.controller.js";
import { faqController } from "../controllers/faq.controller.js";
import { notificationController } from "../controllers/notification.controller.js";
import { favoriteController } from "../controllers/favorite.controller.js";
import { helpDeskController } from "../controllers/help-desk.controller.js";
import { supportInquiryController } from "../controllers/support-inquiry.controller.js";
import { quizController } from "../controllers/quiz.controller.js";
import { analyticsController } from "../controllers/analytics.controller.js";

// Authentication middleware
// This assumes your auth middleware exports `authenticate`.
// Match this import to the actual export in your auth middleware file.
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.post(
  "/auth/signup",
  validateRequest(signupSchema),
  authController.signup,
);

router.post(
  "/auth/login",
  validateRequest(loginSchema),
  authController.login,
);


/*
|--------------------------------------------------------------------------
| User Profile
|--------------------------------------------------------------------------
*/

router.get("/users/profile", authenticate, userController.getProfile);
router.patch("/users/profile", authenticate, userController.updateProfile);

/*
|--------------------------------------------------------------------------
| Organiser Profile
|--------------------------------------------------------------------------
*/

router.get(
  "/organisers/profile",
  authenticate,
  organiserController.getProfile,
);

router.post(
  "/organisers/profile",
  authenticate,
  organiserController.createProfile,
);

router.patch(
  "/organisers/profile",
  authenticate,
  organiserController.updateProfile,
);

/*
|--------------------------------------------------------------------------
| Events
|--------------------------------------------------------------------------
*/

router.get("/events", eventController.getPublished);
router.get("/events/:eventId", authenticate, eventController.getById);

router.post("/events", authenticate, eventController.create);
router.patch("/events/:eventId", authenticate, eventController.update);
router.delete("/events/:eventId", authenticate, eventController.delete);

/*
|--------------------------------------------------------------------------
| Agenda
|--------------------------------------------------------------------------
*/

router.get(
  "/events/:eventId/agenda",
  agendaController.getByEvent,
);

router.post(
  "/events/:eventId/agenda",
  authenticate,
  agendaController.create,
);

router.patch(
  "/agenda/:agendaDayId",
  authenticate,
  agendaController.update,
);

router.delete(
  "/agenda/:agendaDayId",
  authenticate,
  agendaController.delete,
);

/*
|--------------------------------------------------------------------------
| Sessions
|--------------------------------------------------------------------------
*/

router.get(
  "/events/:eventId/sessions",
  sessionController.getByEvent,
);

router.post(
  "/events/:eventId/sessions",
  authenticate,
  sessionController.create,
);

router.patch(
  "/sessions/:sessionId",
  authenticate,
  sessionController.update,
);

router.delete(
  "/sessions/:sessionId",
  authenticate,
  sessionController.delete,
);

router.patch(
  "/sessions/:sessionId/favorite",
  authenticate,
  sessionController.toggleFavorite,
);

/*
|--------------------------------------------------------------------------
| Locations
|--------------------------------------------------------------------------
*/

router.get(
  "/events/:eventId/locations",
  locationController.getByEvent,
);

router.post(
  "/events/:eventId/locations",
  authenticate,
  locationController.create,
);

router.patch(
  "/locations/:locationId",
  authenticate,
  locationController.update,
);

router.delete(
  "/locations/:locationId",
  authenticate,
  locationController.delete,
);

/*
|--------------------------------------------------------------------------
| Speakers
|--------------------------------------------------------------------------
*/

router.get(
  "/events/:eventId/speakers",
  speakerController.getByEvent,
);

router.post(
  "/events/:eventId/speakers",
  authenticate,
  speakerController.create,
);

router.patch(
  "/speakers/:speakerId",
  authenticate,
  speakerController.update,
);

router.delete(
  "/speakers/:speakerId",
  authenticate,
  speakerController.delete,
);

/*
|--------------------------------------------------------------------------
| Registrations
|--------------------------------------------------------------------------
*/

router.post(
  "/events/:eventId/registrations",
  authenticate,
  registrationController.register,
);

router.get(
  "/events/:eventId/registrations",
  authenticate,
  registrationController.getEventRegistrations,
);

router.patch(
  "/registrations/:registrationId/cancel",
  authenticate,
  registrationController.cancel,
);

router.patch(
  "/registrations/:registrationId/review",
  authenticate,
  registrationController.review,
);

/*
|--------------------------------------------------------------------------
| Check-in
|--------------------------------------------------------------------------
*/

router.post(
  "/events/:eventId/check-in",
  authenticate,
  checkInController.checkIn,
);

router.get(
  "/events/:eventId/check-ins",
  authenticate,
  checkInController.getEventCheckIns,
);

/*
|--------------------------------------------------------------------------
| Invitations
|--------------------------------------------------------------------------
*/

router.post(
  "/events/:eventId/invitations",
  authenticate,
  invitationController.create,
);

router.get(
  "/events/:eventId/invitations",
  authenticate,
  invitationController.getByEvent,
);

router.post(
  "/invitations/validate",
  invitationController.validate,
);

/*
|--------------------------------------------------------------------------
| Feedback
|--------------------------------------------------------------------------
*/

router.post(
  "/events/:eventId/feedback",
  authenticate,
  feedbackController.submit,
);

router.get(
  "/events/:eventId/feedback",
  authenticate,
  feedbackController.getByEvent,
);

/*
|--------------------------------------------------------------------------
| FAQs
|--------------------------------------------------------------------------
*/

router.get("/faqs", faqController.getPublished);
router.post("/faqs", authenticate, faqController.create);
router.patch("/faqs/:faqId", authenticate, faqController.update);
router.delete("/faqs/:faqId", authenticate, faqController.delete);

/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

router.get(
  "/notifications",
  authenticate,
  notificationController.getAll,
);

router.post(
  "/notifications",
  authenticate,
  notificationController.create,
);

router.patch(
  "/notifications/:notificationId",
  authenticate,
  notificationController.update,
);

router.delete(
  "/notifications/:notificationId",
  authenticate,
  notificationController.delete,
);

/*
|--------------------------------------------------------------------------
| Favorites
|--------------------------------------------------------------------------
*/

router.get(
  "/favorites",
  authenticate,
  favoriteController.getAll,
);

router.post(
  "/favorites",
  authenticate,
  favoriteController.add,
);

router.delete(
  "/favorites/:itemType/:itemId",
  authenticate,
  favoriteController.remove,
);

/*
|--------------------------------------------------------------------------
| Help Desk
|--------------------------------------------------------------------------
*/

router.get(
  "/events/:eventId/help-desk",
  helpDeskController.getPublished,
);

router.post(
  "/events/:eventId/help-desk",
  authenticate,
  helpDeskController.create,
);

router.patch(
  "/help-desk/:contactId",
  authenticate,
  helpDeskController.update,
);

router.delete(
  "/help-desk/:contactId",
  authenticate,
  helpDeskController.delete,
);

/*
|--------------------------------------------------------------------------
| Support Inquiries
|--------------------------------------------------------------------------
*/

router.post(
  "/events/:eventId/support-inquiries",
  authenticate,
  supportInquiryController.create,
);

router.get(
  "/support-inquiries/my",
  authenticate,
  supportInquiryController.getMine,
);

router.get(
  "/events/:eventId/support-inquiries",
  authenticate,
  supportInquiryController.getByEvent,
);

router.patch(
  "/support-inquiries/:inquiryId",
  authenticate,
  supportInquiryController.update,
);

/*
|--------------------------------------------------------------------------
| Quizzes
|--------------------------------------------------------------------------
*/

router.post("/quizzes", authenticate, quizController.create);

router.get(
  "/events/:eventId/quizzes",
  authenticate,
  quizController.getPublished,
);

router.get(
  "/quizzes/:quizId",
  authenticate,
  quizController.getForAttendee,
);

router.post(
  "/quizzes/:quizId/attempts",
  authenticate,
  quizController.startAttempt,
);

router.post(
  "/quiz-attempts/:attemptId/submit",
  authenticate,
  quizController.submitAttempt,
);

router.get(
  "/quiz-attempts/:attemptId/result",
  authenticate,
  quizController.getResult,
);

/*
|--------------------------------------------------------------------------
| Analytics
|--------------------------------------------------------------------------
*/

router.get(
  "/analytics/dashboard",
  authenticate,
  analyticsController.getDashboard,
);

router.get(
  "/analytics/events/:eventId",
  authenticate,
  analyticsController.getEventAnalytics,
);

export default router;
