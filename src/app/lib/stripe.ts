import Stripe from "stripe";
import config from "../config";

const stripe = new Stripe(config.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
  appInfo: {
    name: "stripe-samples/accept-a-payment",
    url: "https://github.com/stripe-samples",
    version: "0.0.2",
  },
  typescript: true,
});

export default stripe;