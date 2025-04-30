import httpStatus from 'http-status';
import { UserServices } from './user.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../helpers/catchAsync';
import { Request, Response } from 'express';
import pickValidFields from '../../utils/pickValidFields';



const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const options = pickValidFields(req.query, ['limit', 'page', 'email']);
  const id = req.user.id;
  const result = await UserServices.getAllUsersFromDB(options, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Users Retrieve successfully',
    data: result,
  });
});

const llmUsersDetails = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const result = await UserServices.llmUsersDetails(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Users Retrieve successfully',
    data: result,
  });
});

const llmUsersDetailsParams = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await UserServices.llmUsersDetails(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Users Retrieve successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const result = await UserServices.getMyProfileFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const getUserDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.getUserDetailsFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User details retrieved successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const file = req.files as any //as Express.Multer.File[];
  const host = req.header('host') || '';
  const id = req.user.id;
  const bodyData = req.body.bodyData;
  const result = await UserServices.updateMyProfileIntoDB(bodyData, file, req.protocol, host, id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User profile updated successfully',
    data: result,
  });
});


const pauseOrActiveAccount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await UserServices.pauseOrActiveAccountIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: `Account ${req.body.status} successfully`,
    data: result,
  });
});

const findUniqUserName = catchAsync(async (req, res) => {
  const { userName } = req.body;
  if (!userName) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      message: 'userName is required',
    });
  }
  const result = await UserServices.findUniqUserName(userName);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'username is available',
    data: result,
  });
});

const softDelete = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await UserServices.softDelete(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Account deleted successfully',
    data: result,
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await UserServices.deleteMyAccount(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Account deleted successfully',
    data: result,
  });
});

export const UserControllers = {
  getAllUsers,
  llmUsersDetails,
  getMyProfile,
  getUserDetails,
  updateMyProfile,
  pauseOrActiveAccount,
  findUniqUserName,
  softDelete,
  deleteMyAccount,
  llmUsersDetailsParams
};
