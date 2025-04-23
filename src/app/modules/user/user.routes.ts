import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidations } from './user.validation';
import { UserControllers } from './user.controller';
import { UserRoleEnum as Role } from '@prisma/client';
import { fileUploader } from '../../middlewares/fileUploader';
import parseBodyData from '../../middlewares/parseBodyData';
const router = express.Router();

router.get(
  '/',
  auth(Role.SUPER_ADMIN, ),
  UserControllers.getAllUsers
);

router.get('/me', auth("USER"), UserControllers.getMyProfile);

router.get('/:id', auth(), UserControllers.getUserDetails);


router.put(
  '/update-profile',
  auth('USER'),
  fileUploader.uploadMultiple,
  parseBodyData,
  UserControllers.updateMyProfile
);

router.put(
  '/update-user/:id',
  auth('SUPER_ADMIN'),
  UserControllers.updateUserRoleStatus
);

router.post(
  '/find-unique-username',
  validateRequest(UserValidations.findUniqueUsernameValidation),
  UserControllers.findUniqUserName
);
export const UserRouters = router;
