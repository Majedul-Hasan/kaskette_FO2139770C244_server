import { UserGenderEnum, UserStatusEnum, UserRoleEnum } from "@prisma/client";
import z from "zod";
const registerUserSchema = z.object({
  body: z.object({
    subscription: z.string({
      invalid_type_error: "subscription must be a string",
      required_error: "subscription is required",
    }).optional(),
    bookings: z.array(z.string()),
    name: z.string().min(3, "Name must be at least 3 characters"),
    age: z.number().int().positive("Age must be a positive integer"),
    email: z.string().email("Invalid email format"),
    phone: z
      .string()
      .min(5, "Phone must be valid")
      .regex(/^\d+$/, { message: "Phone number must contain only digits" })
      .optional(),
    image: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    gender: z.nativeEnum(UserGenderEnum).refine(
      (val) => Object.values(UserGenderEnum).includes(val),
      (val) => ({
        message: `Invalid gender value: '${val}', expected one of [${Object.values(
          UserGenderEnum
        ).join(", ")}]`,
      })
    ),
    address: z.string().optional(),
    role: z.nativeEnum(UserRoleEnum).default("USER"),
    status: z.nativeEnum(UserStatusEnum).default("in_progress"),
    dateOfBirth: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format for dateOfBirth",
      })
      .optional(),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z
      .string()
      .min(5, "Phone must be valid")
      .regex(/^\d+$/, { message: "Phone number must contain only digits" })
      .optional(),
    gender: z
      .nativeEnum(UserGenderEnum)
      .refine(
        (val) => Object.values(UserGenderEnum).includes(val),
        (val) => ({
          message: `Invalid gender value: '${val}', expected one of [${Object.values(
            UserGenderEnum
          ).join(", ")}]`,
        })
      )
      .optional(),
    address: z.string().optional(),
    dateOfBirth: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format for dateOfBirth",
      })
      .optional(),
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

const verifyOtp = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email({
        message: "Invalid email format!",
      }),
    otp: z.number({
      required_error: "OTP is required!",
    }),
  }),
});

const findUniqueUsernameValidation = z.object({
  body: z.object({
    userName: z.string().min(3, "userName must be at least 3 characters"),
  }),
});

export const UserValidations = {
  registerUserSchema,
  updateProfileSchema,
  forgotPassword,
  verifyOtp,
  findUniqueUsernameValidation
};
