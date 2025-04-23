import { UserGenderEnum, UserInterestedInEnum } from "@prisma/client";
import z from "zod";

const registerUserSchema = z.object({
  body: z.object({
    userName: z.string().min(3, "userName must be at least 3 characters"),
    name: z.string().min(3, "Name must be at least 3 characters"),
    dob: z
      .string({
        required_error: "Date of birth is required",
        invalid_type_error: "Date of birth must be a string",
      })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Date of birth must be a valid date",
      })
      .transform((val) => new Date(val)),
    email: z.string().email("Invalid email format"),
    phone: z
      .string({
        required_error: "Phone number is required",
        invalid_type_error: "Phone number must be a string",
      })
      .min(6, "Phone number must be valid")
      .max(15, "Phone number must be valid"),
    profilePic: z.string().url().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    gender: z.nativeEnum(UserGenderEnum).refine(
      (val) => Object.values(UserGenderEnum).includes(val),
      (val) => ({
        message: `Invalid gender value: '${val}', expected one of [${Object.values(
          UserGenderEnum
        ).join(", ")}]`,
      })
    ),
    interestedIn: z.nativeEnum(UserInterestedInEnum).refine(
      (val) => Object.values(UserInterestedInEnum).includes(val),
      (val) => ({
        message: `Invalid interestedIn value: '${val}', expected one of [${Object.values(
          UserInterestedInEnum
        ).join(", ")}]`,
      })
    ),
    address: z
      .string({
        required_error: "Address is required",
        invalid_type_error: "Address must be a string",
      })
      .min(6, "Address must be at least 6 characters"),
    latitude: z
      .number({
        required_error: "Latitude is required",
        invalid_type_error: "Latitude must be a number",
      })
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    longitude: z
      .number({
        required_error: "Longitude is required",
        invalid_type_error: "Longitude must be a number",
      })
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
    fcmToken: z.string({
      required_error: "fcmToken is required",
      invalid_type_error: "fcmToken must be a string",
    }),
  }),
});

const loginUserSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email({
        message: "Invalid email format!",
      }),
    password: z.string({
      required_error: "Password is required!",
    }),
  }),
});

const passwordResetSchema = z.object({
  body: z.object({
    password: z
      .string({
        required_error: "Password is required!",
      })
      .min(6, "Password must be at least 6 characters long"),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(6),
    newPassword: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters long"),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    otpCode: z
      .string({ required_error: "Opt Code is required" })
      .length(6, "Please enter a 6-character OTP code"),
    hexCode: z
      .string({
        required_error: "hexCode is required",
      })
  }),
});

const forgotPassword = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email({
        message: "Invalid email format!",
      }),
  }),
});

export const authValidation = {
  loginUserSchema,
  registerUserSchema,
  passwordResetSchema,
  changePasswordValidationSchema,
  verifyOtpSchema,
  forgotPassword,
};
