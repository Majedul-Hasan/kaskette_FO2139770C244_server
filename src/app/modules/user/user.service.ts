import prisma from "../../config/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { IPaginationOptions } from "../../interface/pagination.type";
import { paginationHelper } from "../../helpers/paginationHelper";
import fs from "fs";
import path from "path";
import { User, UserRoleEnum, UserStatusEnum } from "@prisma/client";

const getAllUsersFromDB = async (
  options: IPaginationOptions & { email?: string }, userId: string
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const emailFilter: any = options.email
    ? {
        email: {
          contains: options.email, // Case-insensitive search
          mode: "insensitive",
        },
      }
    : {};

  const [result, total, totalTerms] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      where: {
        id: {
          notIn: [userId], // Corrected: 'notIn' is used for array values
        },
        role: {
          not: UserRoleEnum.SUPER_ADMIN,
        },
        ...emailFilter,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        email: true,
        images: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({
      where: {
        id: {
          notIn: [userId],
        },
        role: {
          not: UserRoleEnum.SUPER_ADMIN,
        },
        ...emailFilter,
      },
    }),
    prisma.terms.count({}),
  ]);

  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getMyProfileFromDB = async (id: string) => {
  const Profile = await prisma.user.findUniqueOrThrow({
    where: {
      id: id,
    },
    select: {
      id: true,
      name: true,
      images: true,
      bio: true,
      dob: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Profile;
};

const getUserDetailsFromDB = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      phone: true,
      name: true,
      role: true,
      email: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

const updateMyProfileIntoDB = async (
  payload: Partial<User>,
  file: any,
  protocol: string,
  host: string,
  userId: string
) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check if there is an existing image and delete it from the file system
  if (existingUser.images) {
    const filenames = existingUser.images.map(
      (image) => image.split("/uploads/")[1]
    );
    for (const filename of filenames) {
      const imagePath = path.join(process.cwd(), "uploads", filename);

      try {
        // Check if the image exists on the file system
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Remove the existing image file from the server
          console.log("Deleted the existing image:", imagePath);
        } else {
          console.log("Image not found, skipping deletion.");
        }
      } catch (err) {
        console.error("Error deleting existing image:", err);
      }
    }
  }
  // Prepare the updated data object
  const updatedData = {
    ...payload,
    images: file
      ? file.map((img: any) => `${protocol}://${host}/uploads/${img.filename}`)
      : existingUser.images, // Update the image if provided
  };
  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updatedData,
    select: {
      id: true,
      name: true,
      bio: true,
      language: true,
      dob: true,
      email: true,
      images: true,
      profession: true,
    },
  });

  return result;
};

const pauseOrActiveAccountIntoDB = async (
  id: string,
  payload: { status: Partial<UserStatusEnum> }
) => {

  if (payload.status === UserStatusEnum.blocked) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You cannot change the status to blocked"
    );
  }

  const result = await prisma.user.update({
    where: {
      id: id,
    },
    data: payload,
    select: {
      id: true,
      name: true,
      role: true,
      email: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return result;
};

const findUniqUserName = async (userName: string) => {
  // Check if the username already exists in the database
  const existingUser = await prisma.user.findUnique({
    where: { userName },
  });
  // If the username exists, throw an error
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "Username already exists");
  }
  // If the username is unique, return a success message
  return {
    message: "Username is available",
  };
};

const softDelete = async (id: string) => {
  // Check if the user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Soft delete the user by setting the deletedAt field to the current date
  const result = await prisma.user.update({
    where: { id },
    data: {
      isDelete: true,
      status: UserStatusEnum.deactivated,
      deletedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      status: true,
      createdAt: true,
      deletedAt: true,
      isDelete: true,
    },
  });

  return result;
};

const deleteMyAccount = async (id: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await prisma.user.delete({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return result;
};
export const UserServices = {
  getAllUsersFromDB,
  getMyProfileFromDB,
  getUserDetailsFromDB,
  updateMyProfileIntoDB,
  pauseOrActiveAccountIntoDB,
  findUniqUserName,
  softDelete,
  deleteMyAccount,
};

const SubscriptionFeatured = [
  {
    name: "LOVES",
    price: 0,
    duration: 0,
    features: ["Unlimited messages", "Unlimited likes"],
  },
  {
    name: "Lov_Starter",
    price: 0,
    duration: 0,
    features: ["Unlimited messages", "Unlimited likes"],
  },
  {
    name: "Lov_Start",
    price: 0,
    duration: 0,
    features: ["Unlimited messages", "Unlimited likes"],
  },
  {
    name: "Lov_Explorer",
    price: 0,
    duration: 0,
    features: ["Unlimited messages", "Unlimited likes"],
  },
  {
    name: "Lov_Connect",
    price: 0,
    duration: 0,
    features: ["Unlimited messages", "Unlimited likes"],
  },
  {
    name: "Lov_Elite",
    price: 0,
    duration: 0,
    features: ["Unlimited messages", "Unlimited likes"],
  },
  {
    name: "Reveal_1",
    price: 0,
    duration: 0,
    features: ["Unlimited messages", "Unlimited likes"],
  },
  {
    name: "Reveal_3",
    price: 0,
    duration: 0,
    features: ["Unlimited messages", "Unlimited likes"],
  },
  {
    name: "Reveal_4",
    price: 0,
    duration: 0,
    features: ["Unlimited messages", "Unlimited likes"],
  },
];
