
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  role: string;
}

interface AccessTokenPayload extends JwtPayload {
  userId: string;
  tenantId: string;
  role: string;
}

/**
 * Extracts and verifies the JWT access token.
 */
function verifyAccessToken(token: string): AuthenticatedUser {
  let decoded: string | JwtPayload;

  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired authentication token", 401);
  }

  if (typeof decoded === "string") {
    throw new AppError("Invalid authentication token", 401);
  }

  const payload = decoded as AccessTokenPayload;

  if (
    typeof payload.userId !== "string" ||
    typeof payload.tenantId !== "string" ||
    typeof payload.role !== "string"
  ) {
    throw new AppError("Invalid authentication token payload", 401);
  }

  return {
    id: payload.userId,
    tenantId: payload.tenantId,
    role: payload.role,
  };
}

/**
 * Authentication middleware.
 *
 * Reads the JWT from:
 * Authorization: Bearer <token>
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError("Authentication token is required", 401);
    }

    const [scheme, token, ...extraParts] = authorization.split(" ");

    if (
      scheme !== "Bearer" ||
      !token ||
      extraParts.length > 0
    ) {
      throw new AppError(
        "Invalid authorization header. Use Bearer token",
        401,
      );
    }

    const authenticatedUser = verifyAccessToken(token);

    req.user = authenticatedUser;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role authorization middleware.
 *
 * Example:
 * authorizeRoles("organiser")
 */
export function authorizeRoles(...allowedRoles: string[]) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError(
          "You do not have permission to perform this action",
          403,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
