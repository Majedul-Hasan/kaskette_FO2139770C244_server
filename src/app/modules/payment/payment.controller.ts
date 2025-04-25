import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentServices } from "./payment.service";

const paymentIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.paymentIntent(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment Intent successfully",
    data: result,
  });
});



export const PaymentController = {
    paymentIntent,
};
