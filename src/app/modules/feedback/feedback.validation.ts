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

export const FeedbackValidations = {
  createFeedbackValidation,
};
