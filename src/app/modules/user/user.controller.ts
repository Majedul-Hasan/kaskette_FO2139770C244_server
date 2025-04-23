import httpStatus from 'http-status';
import { UserServices } from './user.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../helpers/catchAsync';
import { Request, Response } from 'express';
import pickValidFields from '../../utils/pickValidFields';



const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const options = pickValidFields(req.query, ['limit', 'page', 'email']);

  const result = await UserServices.getAllUsersFromDB(options);

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

const updateMyProfileImage = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const file = req.file as any;
  const host = req.header("host") || '';
  const result = await UserServices.updateMyProfileImageIntoDB(id, file, req.protocol, host);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User profile updated successfully',
    data: result,
  });
});

const updateUserRoleStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.updateUserRoleStatusIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User updated successfully',
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


export const UserControllers = {
  getAllUsers,
  getMyProfile,
  getUserDetails,
  updateMyProfile,
  updateMyProfileImage,
  updateUserRoleStatus,
  findUniqUserName
};
