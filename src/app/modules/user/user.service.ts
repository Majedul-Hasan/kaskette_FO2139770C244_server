import prisma from "../../config/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { IPaginationOptions } from "../../interface/pagination.type";
import { paginationHelper } from "../../helpers/paginationHelper";
import fs from "fs";
import path from "path";
import { User } from "@prisma/client";

const getAllUsersFromDB = async (
  options: IPaginationOptions & { email?: string }
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
        role: {
          not: "SUPER_ADMIN",
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
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({
      where: {
        role: {
          not: "SUPER_ADMIN",
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

const updateMyProfileIntoDB = async ( payload: Partial<User>, file: any, protocol:string , host: string, userId: string) => {
  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User ID is required");
  }
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  // Check if there is an existing image and delete it from the file system
  if (existingUser.images) {
    const filenames = existingUser.images.map(image => image.split("/uploads/")[1]); 
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
      role: true,
      email: true,
      images: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

const updateMyProfileImageIntoDB = async (
  id: string,
  file: any,
  protocol: string,
  host: string
) => {
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User ID is required");
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check if there is an existing image and delete it from the file system
  if (existingUser.profilePic) {
    const filename = existingUser.profilePic.split("/uploads/")[1]; 
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
  // Prepare the updated data object
  const updatedData = {
    image: file
      ? `${protocol}://${host}/uploads/${file.filename}`
      : existingUser.profilePic, // Update the image if provided
  };

  const result = await prisma.user.update({
    where: {
      id: id,
    },
    data: updatedData,
    select: {
      id: true,
      name: true,
      role: true,
      email: true,
      profilePic: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return result;
};

const updateUserRoleStatusIntoDB = async (id: string, payload: any) => {
  const result = await prisma.user.update({
    where: {
      id: id,
    },
    data: payload,
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

export const UserServices = {
  getAllUsersFromDB,
  getMyProfileFromDB,
  getUserDetailsFromDB,
  updateMyProfileIntoDB,
  updateMyProfileImageIntoDB,
  updateUserRoleStatusIntoDB,
  findUniqUserName,
};
