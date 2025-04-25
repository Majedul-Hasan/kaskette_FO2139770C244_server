import Stripe from "stripe";
import stripe from "../../lib/stripe";
const calculateTax = false;

const calculate_tax = async (orderAmount: number, currency: string) => {
  const taxCalculation = await stripe.tax.calculations.create({
    currency,
    customer_details: {
      address: {
        line1: "10709 Cleary Blvd",
        city: "Plantation",
        state: "FL",
        postal_code: "33322",
        country: "US",
      },
      address_source: "shipping",
    },
    line_items: [
      {
        amount: orderAmount,
        reference: "ProductRef",
        tax_behavior: "exclusive",
        tax_code: "txcd_30011000",
      },
    ],
  });

  return taxCalculation;
};

const paymentIntent = async (req: any) => {
  const price = req.body.price || 1400;   

  const paymentIndented: Stripe.PaymentIntent = await stripe.paymentIntents.create({  
    currency: "usd",
    amount: price,
    automatic_payment_methods: { enabled: true },
  });
  return {paymentIndented: paymentIndented.client_secret, amount: paymentIndented.amount};
};

// const createPaymentIntent = async (req: any) => {
//   let orderAmount = 1400;
//     let paymentIntent: Stripe.PaymentIntent;

//     try {
//       if (calculateTax) {
//         let taxCalculation = await calculate_tax(orderAmount, "usd");

//         paymentIntent = await stripe.paymentIntents.create({
//           currency: "usd",
//           amount: taxCalculation.amount_total,
//           automatic_payment_methods: { enabled: true },
//           metadata: { tax_calculation: taxCalculation.id },
//         });
//       } else {
//         paymentIntent = await stripe.paymentIntents.create({
//           currency: "usd",
//           amount: orderAmount,
//           automatic_payment_methods: { enabled: true },
//         });
//       }
//       return paymentIntent;
//     } catch (error) {
//       if (error instanceof Stripe.errors.StripeError) {
//         // Handle Stripe-specific errors
//         console.error("Stripe error:", error.message);
//         throw new Error("Payment processing error. Please try again.");
//       }
//     }
//   };




export const PaymentServices = {
  paymentIntent,
};

// const paymentIntent = async (req: any) => {
//     let orderAmount = 1400;
//     let paymentIntent: Stripe.PaymentIntent;

//     try {
//       if (calculateTax) {
//         let taxCalculation = await calculate_tax(orderAmount, "usd");

//         paymentIntent = await stripe.paymentIntents.create({
//           currency: "usd",
//           amount: taxCalculation.amount_total,
//           automatic_payment_methods: { enabled: true },
//           metadata: { tax_calculation: taxCalculation.id },
//         });
//       } else {
//         paymentIntent = await stripe.paymentIntents.create({
//           currency: "usd",
//           amount: orderAmount,
//           automatic_payment_methods: { enabled: true },
//         });
//       }
//       return paymentIntent;
//     } catch (error) {
//       if (error instanceof Stripe.errors.StripeError) {
//         // Handle Stripe-specific errors
//         console.error("Stripe error:", error.message);
//         throw new Error("Payment processing error. Please try again.");
//       }
//     }
//   };
