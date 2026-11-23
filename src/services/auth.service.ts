
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

interface SignupData {
  fullName: string;
  email: string;
  password: string;
  mobileNumber?: string;
  role?: "attendee" | "organiser";
  designation?: string;
  organization?: string;
  organiserType?: string;
  about?: string;
  interests?: string[];
}

interface LoginData {
  email: string;
  password: string;
  expectedRole?: "attendee" | "organiser" | "admin";
  expectedTenantId?: string;
}

export async function signup(data: SignupData) {
  const email = data.email.toLowerCase().trim();
  const role = data.role ?? "attendee";

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const now = new Date();

  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      fullName: data.fullName.trim(),
      email,
      passwordHash,
      mobileNumber: data.mobileNumber,
      role,
      designation: data.designation,
      organization: data.organization,
      about: data.about,
      interests: data.interests?.join(",") ?? null,
      tenantId: "default",
      createdAt: now,
      updatedAt: now,

      ...(role === "organiser"
        ? {
            organiserProfiles: {
              create: {
                id: randomUUID(),
                organisationName: data.organization,
                organiserType: data.organiserType,
                designation: data.designation,
                description: data.about,
                createdAt: now,
                updatedAt: now,
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      mobileNumber: true,
      role: true,
      designation: true,
      organization: true,
      about: true,
      interests: true,
      tenantId: true,
      organiserProfiles: {
        select: {
          id: true,
          organisationName: true,
          organiserType: true,
          designation: true,
          description: true,
        },
      },
    },
  });

  return user;
}

export async function login(data: LoginData) {
  const email = data.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      organiserProfiles: {
        select: {
          id: true,
          organisationName: true,
          organiserType: true,
          designation: true,
          description: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  if (data.expectedRole && user.role !== data.expectedRole) {
    throw new AppError("Selected role does not match this account", 403);
  }

  if (
    data.expectedTenantId &&
    user.tenantId !== data.expectedTenantId
  ) {
    throw new AppError("Account does not belong to the selected tenant", 403);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      designation: user.designation,
      organization: user.organization,
      profileImagePath: user.profileImagePath,
      about: user.about,
      interests: user.interests,
      tenantId: user.tenantId,
      organiserProfiles: user.organiserProfiles,
    },
    token,
  };
}
