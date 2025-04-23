import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FeedbackServices } from './feedback.service';


const sendFeedback = catchAsync(async (req, res) => {

    const result = await FeedbackServices.sendFeedback(req.user.id ,req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Feedback sent successfully',
        data: result,
    });

});


export const FeedbackControllers = {
 sendFeedback
};
