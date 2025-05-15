import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma";
import { UserCreateSchema } from "../schemas";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const userRegistration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Validate the req body
        const parseBody = UserCreateSchema.safeParse(req.body);
        if(!parseBody.success) {
            res.status(400).json({ message: 'invalid request body', error: parseBody.error.errors });
            return;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: parseBody.data.email
            }
        });

        if(existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(parseBody.data.password, salt);

        // Create the auth user
        const user = await prisma.user.create({
            data: {
                ...parseBody.data,
                password: hashedPassword
            },
            select: {
                role: true,
                status: true,
                verified: true,
                id: true,
                name: true,
                email: true
            }
        });

        // Create the user profile by calling the user service
        await axios.post(`${process.env.USER_SERVICE_URL}/users`, {
            authUserId: user.id,
            name: user.name,
            email: user.email
        });

        res.status(201).json(user);
        return;
    } catch (error) {
        next(error);
    }
};

export default userRegistration;