import { PlanType } from "@prisma/client";
import { z } from "zod";

const subscribePlan = z.object({
  body: z.object({
    price: z.number().min(0, "Price must be a positive number"),
    name: z.nativeEnum(PlanType).refine(
      (val) => Object.values(PlanType).includes(val),
      (val) => ({
        message: `Invalid Plan name value: '${val}', expected one of [${Object.values(
          PlanType
        ).join(", ")}]`,
      })
    ),
    feature: z.array(z.string()).min(1, "Features must not be empty"),
    duration: z.number().min(1, "Duration must be at least 1 day").default(30),
    // token: z.number().min(0, "Token must be a non-negative number"),
  }),
});

export const SubscribeValidation = {
  subscribePlan,
};
