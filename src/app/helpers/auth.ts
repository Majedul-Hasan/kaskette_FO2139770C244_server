import crypto from "crypto";
import { sendOTPEmail } from "../modules/auth/auth.utils";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Function to generate OTP and expiry for a user
const generateOTP = (minute: number) => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + minute * 60 * 1000); // 10 minutes expiry
  const hexCode = crypto.randomBytes(16).toString("hex");
  return { otpCode, expiry, hexCode };
};

// Create a new OTP or update the existing one in the database
const saveOrUpdateOTP = async (email: string, otpCode: string, expiry: Date, identifier: string) => {
    return await prisma.otp.upsert({
      where: { email },
      update: { otp: otpCode, expiry, hexCode: identifier },
      create: { email, otp: otpCode, expiry, hexCode: identifier },
    });
  };



const OTPGenerationSavingAndSendingEmail = async (
  email: string,
  minutes?: number
): Promise<{ hexCode: string }> => {
  const { otpCode, expiry, hexCode } = generateOTP(minutes || 5); // 5 minutes expiry
  await saveOrUpdateOTP(email, otpCode, expiry, hexCode);
  await sendOTPEmail(email, otpCode);
  return { hexCode };
};

export default OTPGenerationSavingAndSendingEmail;
