import express from 'express';
import auth from '../../middlewares/auth';
import { SubscribeController } from './subscribe.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SubscribeValidation } from './subscribe.validation';

const router = express.Router();

router.post(
  "/",
  auth("SUPER_ADMIN"),
  validateRequest(SubscribeValidation.subscribePlan),
  SubscribeController.subscribeCreate
);



export const SubscribeRouters = router;
