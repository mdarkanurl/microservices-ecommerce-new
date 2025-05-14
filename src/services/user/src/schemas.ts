import { z } from "zod";

export const userCreateSchema = z.object({
    authUserId: z.string(),
    name: z.string(),
    email: z.string().email(),
    address: z.string().optional(),
    phone: z.string().optional()
});

export const userUpdateSchema = userCreateSchema.omit({ authUserId: true }).partial();