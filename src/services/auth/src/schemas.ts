import { z } from "zod";

export const UserCreateSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(3)
});

export const UserLoginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const accessTokenSchema = z.object({
    accessToken: z.string()
});

export const emailVerificationSchema = z.object({
    email: z.string().email(),
    code: z.string()
});