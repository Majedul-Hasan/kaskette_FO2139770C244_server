import express from 'express';
import { AuthRouters } from '../modules/auth/auth.routes';

import { UserRouters } from '../modules/user/user.routes';
import { FeedbackRouters } from '../modules/feedback/feedback.route';
import { ChatRouters } from '../modules/chat/chat.route';
import { NotificationsRouters } from '../modules/notifications/notification.routes';
import { PaymentRouters } from '../modules/payment/payment.route';



const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRouters,
  },
  {
    path: '/users',
    route: UserRouters,
  },
  {
    path: '/feedback',
    route: FeedbackRouters,
  },
  {
    path: '/chats',
    route: ChatRouters,
  },
  {
    path: '/notification',
    route: NotificationsRouters,
  },
  {
    path: '/payment',
    route: PaymentRouters,
  },


];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
