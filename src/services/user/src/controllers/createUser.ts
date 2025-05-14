import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { userCreateSchema } from "../schemas";

const createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Validate the request body
        const parseBody = userCreateSchema.safeParse(req.body);
        if(!parseBody.success) {
            res.status(400).json({ message: parseBody.error.errors });
            return;
        }

        // Check if authUser already exists
        const existingUser = await prisma.user.findUnique({
            where: { authUserId: parseBody.data.authUserId }
        });

        if(existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const user = await prisma.user.create({
            data: parseBody.data
        });

        res.status(201).json(user);
        return;
    } catch (error) {
        next(error);
    }
}

export default createUser;