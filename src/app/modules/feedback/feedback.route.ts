import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { FeedbackValidations } from "./feedback.validation";
import auth from "../../middlewares/auth";
import { FeedbackControllers } from "./feedback.controller";
const router = express.Router();

router.post(
    "/",
    auth("USER"),
    validateRequest(FeedbackValidations.createFeedbackValidation),
    FeedbackControllers.sendFeedback
);

router.post(
    "/options",
    auth("SUPER_ADMIN"),
    validateRequest(FeedbackValidations.addSelectFeedbackOpinion),
    FeedbackControllers.addSelectFeedbackOpinion
);

export const FeedbackRouters = router;