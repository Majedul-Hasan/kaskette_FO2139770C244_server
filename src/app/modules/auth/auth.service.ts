import * as bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import prisma from "../../config/prisma";
import crypto from "crypto";
import sentEmailUtility from "../../utils/sentEmailUtility";
import { emailText } from "../../utils/emailTemplate";
import { User, UserStatusEnum, UserRoleEnum } from "@prisma/client";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import ApiError from "../../errors/ApiError";
import { S3Uploader } from "../../lib/S3Uploader";
import { hashPasswordGenerator, OTPGenerationSavingAndSendingEmail } from "../../helpers/auth";
// import OTPGenerationSavingAndSendingEmail from "../../helpers/auth";

const registrationNewUser = async (payload: User, file: any) => {
  // Check if the file is an array and has at least one file
  if (!Array.isArray(file) || file.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please upload at least 2 images");
  }

  // Check if the file is an image
  if (file && file.length > 0) {
    // Upload multiple files to S3
    const uploadPromises = file.map((file: any) =>
      S3Uploader.uploadToS3(file, "user")
    );
    const uploadResults = await Promise.all(uploadPromises);
    payload.images = uploadResults.map((result) => result.Location); // Update the payload with S3 URLs
  }

  return await prisma.$transaction(async (prisma) => {
    // Check if email is already registered and Verified
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser && existingUser.isVerified) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "This email is already registered"
      );
    }

    if (!(payload.images.length >= 2)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Please upload at least 2 images");
    }else if (payload.images.length > 8) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Maximum 8 images are allowed");
    }
    // Hash the password
    // const hashPassword = await bcrypt.hash(
    //   payload.password!,
    //   Number(config.bcrypt_salt_rounds)
    // );
    const hashPassword = await hashPasswordGenerator(payload.password!)

    let newUser;
    // Create new user if not existing
    if (!existingUser) {
      newUser = await prisma.user.create({
        data: {
          userName: payload.userName,
          name: payload.name,
          dob: payload.dob,
          gender: payload.gender,
          interestedIn: payload.interestedIn,
          address: payload.address,
          latitude: payload.latitude,
          longitude: payload.longitude,
          email: payload.email,
          phone: payload.phone,
          password: hashPassword,
          images: payload.images,
          role: UserRoleEnum.USER,
          fcmToken: payload.fcmToken,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          images: true,
          status: true,
          fcmToken: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else {
      newUser = await prisma.user.update({
        where: { email: payload.email },
        data: {
          userName: payload.userName,
          name: payload.name,
          dob: payload.dob,
          gender: payload.gender,
          interestedIn: payload.interestedIn,
          address: payload.address,
          latitude: payload.latitude,
          longitude: payload.longitude,
          email: payload.email,
          phone: payload.phone,
          password: hashPassword,
          images: payload.images,
          role: UserRoleEnum.USER,
          fcmToken: payload.fcmToken,
        },
      });
    }

    const otp = await OTPGenerationSavingAndSendingEmail(newUser.email);

    return {
      id: newUser.id,
      name: newUser.name,
      role: newUser.role,
      images: newUser.images,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      hexCode: otp.hexCode,
    };
  });
};

const verifyEmail = async (hexCode: string, otpCode: string) => {
  return await prisma.$transaction(async (prisma) => {
    // Find OTP record
    const otpRecord = await prisma.otp.findFirst({
      where: { hexCode: hexCode, otp: otpCode },
    });
    //
    if (otpRecord?.otp !== otpCode) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP or expired OTP");
    }

    if (!otpRecord) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP or expired OTP");
    }

    // Delete OTP record
    await prisma.otp.deleteMany({ where: { email: otpRecord.email } });

    // Update user verification status
    const updatedUser = await prisma.user.update({
      where: { email: otpRecord.email },
      data: {
        isVerified: true,
        status: UserStatusEnum.in_progress,
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        images: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true,
        isVerified: true,
        fcmToken: true,
      },
    });

    // Generate access token
    const accessToken = jwtHelpers.generateToken(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string
    );

    return {
      ...updatedUser,
      accessToken,
    };
  });
};

const loginUserFromDB = async (payload: {
  email: string;
  password: string;
  fcmToken?: string;
}) => {
  // Find the user by email
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  // Check if the user is verified
  if (!userData.isVerified) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Please verify your email before logging in."
    );
  }

  // Check if the password is correct
  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    userData.password as string
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect");
  }

  // Update the FCM token if provided
  if (payload?.fcmToken) {
    await prisma.user.update({
      where: {
        email: payload.email, // Use email as the unique hexCode for updating
      },
      data: {
        fcmToken: payload.fcmToken,
      },
    });
  }

  // Generate an access token
  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email as string,
      role: userData.role,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in
  );

  // Return user details and access token
  return {
    id: userData.id,
    email: userData.email,
    role: userData.role,
    accessToken: accessToken,
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! with this email " + payload.email
    );
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  const identifier = crypto.randomBytes(16).toString("hex");

  // Save OTP to database
  const userData = await prisma.otp.upsert({
    where: { email: user.email },
    update: {
      email: user.email,
      otp: otpCode,
      expiry: expiry,
      hexCode: identifier,
    },
    create: {
      email: user.email,
      otp: otpCode,
      expiry: expiry,
      hexCode: identifier,
    },
  });

  // Send OTP via email
  await sentEmailUtility(
    user.email,
    "Reset Your Password",
    emailText("Reset Password", otpCode)
  );
  return {
    hexCode: userData.hexCode,
  };
};

const verifyOtpCode = async (payload: { hexCode: string; otpCode: string }) => {
  const otpRecord = await prisma.otp.findFirst({
    where: {
      hexCode: payload.hexCode,
      otp: payload.otpCode,
    },
  });

  if (!otpRecord) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid OTP");
  }

  // Check if OTP is expired
  if (new Date() > otpRecord.expiry) {
    // If valid, delete the OTP from the database
    await prisma.otp.delete({
      where: {
        id: otpRecord.id,
      },
    });

    throw new ApiError(
      httpStatus.GONE,
      "The OTP has expired. Please request a new one."
    );
  }
  // If OTP is valid, delete the OTP from the database
  const [user, record] = await prisma.$transaction([
    prisma.user.findUnique({
      where: { email: otpRecord.email },
      select: {
        id: true,
        email: true,
      },
    }),
    prisma.otp.delete({
      where: {
        id: otpRecord.id,
      },
    }),
  ]);

  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! user is possibly deleted by mistake please register"
    );
  }
  // Generate an access token
  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
    },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_expires_in as string
  );
  // Hash the new password
  return { accessToken };
};

const resetPassword = async (
  userId: string,
  payload: {
    password: string;
  }
) => {
  const userToUpdate = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userToUpdate) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found in the database.");
  }

  // If valid, delete the OTP from the database
  const updatedUser = await prisma.user.update({
    where: { id: userToUpdate.id },
    data: {
      password: await bcrypt.hash(
        payload.password,
        Number(config.bcrypt_salt_rounds)
      ),
    },
  });

  if (!updatedUser) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User not found in the database."
    );
  }
  return {
    message: "password updated successfully",
  };
};

const changePassword = async (payload: {
  id: string;
  newPassword: string;
  oldPassword: string;
}) => {
  const userData = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      password: true,
      email: true,
      id: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!userData) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found!, If you have already have account please reset your password"
    );
  }

  // Check if the user status is BLOCKED
  if (userData.status === UserStatusEnum.blocked) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Your account has been blocked. Please contact support."
    );
  }

  // Check if the password is correct
  const isCorrectPassword = await bcrypt.compare(
    payload.oldPassword,
    userData.password as string
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect");
  }
  // Hash the user's password

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );
  // Update the user's password in the database template
  const updatedUser = await prisma.user.update({
    where: { id: payload.id },
    data: {
      password: hashedPassword,
    },
  });
  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found in the database.");
  }
  return {
    message: "password updated successfully",
  };
};

const socialLogin = async (payload: any) => {
  const user = await prisma.user.findFirst({
    where: {
      email: payload.email,
    },
  });

  // If user exists then login the user
  // Update the FCM token if provided
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { fcmToken: payload.fcmToken || null },
    });
    // Generate an access token
    const accessToken = jwtHelpers.generateToken(
      {
        id: user.id,
        email: user.email as string,
        role: user.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in
    );

    return {
      id: user.id,
      name: user.name,
      userName: user.userName,
      email: user.email,
      role: user.role,
      accessToken: accessToken,
    };
  }

  // If user doesn't exist, create a new user
  const newUser = await prisma.user.create({
    data: {
      email: payload.email,
      name: payload.name,
      userName: payload.userName,
      images: payload.images,
      fcmToken: payload.fcmToken || null,
      isVerified: true,
      emailVerified: true,
      status: UserStatusEnum.in_progress,
    },
  });
  // Generate an access token
  const accessToken = jwtHelpers.generateToken(
    {
      id: newUser.id,
      email: newUser.email as string,
      role: newUser.role,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in
  );
  return {
    id: newUser.id,
    name: newUser.name,
    userName: newUser.userName,
    email: newUser.email,
    role: newUser.role,
    accessToken: accessToken,
  };
};

export const AuthServices = {
  loginUserFromDB,
  registrationNewUser,
  forgotPassword,
  verifyEmail,
  verifyOtpCode,
  resetPassword,
  changePassword,
  socialLogin,
};
