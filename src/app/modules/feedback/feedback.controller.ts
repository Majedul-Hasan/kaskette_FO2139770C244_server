import httpStatus from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { FeedbackServices } from "./feedback.service";

const sendFeedback = catchAsync(async (req, res) => {
  const result = await FeedbackServices.sendFeedback(req.user.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Feedback sent successfully",
    data: result,
  });
});

const addSelectFeedbackOpinion = catchAsync(async (req, res) => {

  const result = await FeedbackServices.addSelectFeedbackOptions(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Feedback options added successfully",
    data: result,
  });
});

const getFeedbackOptions = catchAsync(async (req, res) => {

  const result = await FeedbackServices.getFeedbackOptions();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Feedback options retrieved successfully",
    data: result,
  });
});

export const FeedbackControllers = {
  sendFeedback,
  addSelectFeedbackOpinion,
  getFeedbackOptions
};
