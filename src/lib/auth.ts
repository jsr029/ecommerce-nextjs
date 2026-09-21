import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-me";

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export function getAuth(request: NextRequest): AuthPayload | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function requireAdmin(request: NextRequest): AuthPayload | null {
  const user = getAuth(request);
  if (!user || user.role !== "admin") return null;
  return user;
}

export function requireUser(request: NextRequest): AuthPayload | null {
  return getAuth(request);
}
