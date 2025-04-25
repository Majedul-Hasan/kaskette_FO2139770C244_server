import express from 'express';
import auth from '../../middlewares/auth';
import { PaymentController } from './payment.controller';

const router = express.Router();

router.post(
  "/create-payment-intent",
  PaymentController.paymentIntent
);



export const PaymentRouters = router;
