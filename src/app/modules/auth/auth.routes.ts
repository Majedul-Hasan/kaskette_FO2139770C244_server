import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { authValidation } from './auth.validation';
import { AuthControllers } from './auth.controller';
import auth, {checkOTP} from '../../middlewares/auth';
import { UserValidations } from '../user/user.validation';
const router = express.Router();



router.post('/register',
  validateRequest(authValidation.registerUserSchema),
  AuthControllers.registrationNewUser);

router.post(
  '/login',
  validateRequest(authValidation.loginUserSchema),
  AuthControllers.loginUser
);
router.post(
  '/forgot-password',
  validateRequest(authValidation.forgotPassword),
  AuthControllers.forgotPassword
);

router.post(
  '/reset-password',
  checkOTP(),
  validateRequest(authValidation.passwordResetSchema),
  AuthControllers.resetPassword
);
router.post(
  '/verify-otp',
  validateRequest(authValidation.verifyOtpSchema),
  AuthControllers.verifiedEmail
);

router.post(
  '/change-password',
  validateRequest(authValidation.changePasswordValidationSchema),
  auth("USER"),
  AuthControllers.changePassword
);

// router.get(
//   '/me',
//   auth("USER"),
//   AuthControllers.getMe
// );

export const AuthRouters = router;


// const identifier = crypto.randomBytes(16).toString('hex');