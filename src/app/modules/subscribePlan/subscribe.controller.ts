import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SubscribeServices } from "./subscribe.service";

const subscribeCreate = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscribeServices.subscribeCreate(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Plan create successfully",
    data: result,
  });
});



export const SubscribeController = {
    subscribeCreate,
};
