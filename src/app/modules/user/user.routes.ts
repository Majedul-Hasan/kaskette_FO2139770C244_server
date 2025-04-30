import express from 'express';
import auth, { optionalAuth } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidations } from './user.validation';
import { UserControllers } from './user.controller';
import { UserRoleEnum as Role } from '@prisma/client';
import { fileUploader } from '../../middlewares/fileUploader';
import parseBodyData from '../../middlewares/parseBodyData';
const router = express.Router();

router.get(
  '/',
  auth(Role.SUPER_ADMIN, Role.USER),
  UserControllers.getAllUsers
);
router.get(
  '/llm-users-details',
  auth(Role.USER),
  UserControllers.llmUsersDetails
);

router.get(
  '/llm-users-details/:id',
  UserControllers.llmUsersDetailsParams
);

router.post(
  '/suggest-for-me',
  auth(Role.USER),
  UserControllers.suggestForMe
);

router.get('/me', auth("USER"), UserControllers.getMyProfile);

router.get('/:id', auth("USER", "SUPER_ADMIN"), UserControllers.getUserDetails);


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


// router.put(
//   "/update-profile",
//   auth("USER"),
//   fileUploader.uploadMultiple,
//   (req: Request, res: Response, next: NextFunction) => {
//     req.body = UserValidations.updateProfileSchema.parse(
//       JSON.parse(req.body.data)
//     );
//     return UserControllers.updateMyProfile(req, res, next);
//   },
//   // UserControllers.updateMyProfile
// );