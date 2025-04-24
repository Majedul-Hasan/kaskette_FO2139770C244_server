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
  '/pause-or-active-account',
  auth('USER'),
  validateRequest(UserValidations.pauseOrActiveAccountIntoDB),
  UserControllers.pauseOrActiveAccount
);

router.post(
  '/find-unique-username',
  validateRequest(UserValidations.findUniqueUsernameValidation),
  UserControllers.findUniqUserName
);

// soft delete account
router.put(
  '/soft-delete',
  auth('USER'),
  UserControllers.softDelete
);

router.delete(
  '/delete-my-account',
  auth('USER'),
  UserControllers.deleteMyAccount
);

export const UserRouters = router;
