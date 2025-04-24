import { z } from "zod";

const createFeedbackValidation = z.object({
  body: z.object({
    appVersion: z.string().optional(),
    rating: z
      .number({ required_error: "Rating is required!" })
      .min(1, { message: "Rating must be at least 1" })
      .max(5, { message: "Rating must be at most 5" }),
    selectedOpinions: z.array(
      z.string({ required_error: "selectedOpinions is required!" })
    ),
    otherOpinion: z.string().optional(),
    comment: z.string({ required_error: "comment is required!" }),
  }),
});

const addSelectFeedbackOpinion = z.object({
  body: z.object({
    options : z.array(z.string().min(1, { message: "Each option must be a non-empty string" }))
    .max(6, { message: "Maximum 6 options allowed" }).min(5, { message: "At least 6 option is required" })
  }),
});

export const FeedbackValidations = {
  createFeedbackValidation,
  addSelectFeedbackOpinion
};
