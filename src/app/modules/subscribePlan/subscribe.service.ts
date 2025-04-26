import { Plan, PlanType } from "@prisma/client";
import prisma from "../../config/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const subscribeCreate = async (payload: Plan) => {
  const planExist = await prisma.plan.findFirst({
    where: {
      name: payload.name,
    },
  });
  if (planExist) {
    throw new ApiError(httpStatus.CONFLICT, "Plan already exists");
  }

  const tokenPlan =
    payload.name === PlanType.Reveal_1 ||
    payload.name === PlanType.Reveal_3 ||
    payload.name === PlanType.Reveal_4;
  if (tokenPlan && !payload.token) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "token is required for this plan"
    );
  }

  const result = await prisma.plan.create({
    data: {
      ...payload,
      token: tokenPlan ? payload.token : undefined,
    },
  });
  return result;
};

export const SubscribeServices = {
  subscribeCreate,
};
