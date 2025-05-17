import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma";
import { UserCreateSchema } from "../schemas";
import axios from "axios";
import dotenv from "dotenv";
import { generateVerificationCode } from "../utils";
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

        // generate verification code
        const code = generateVerificationCode();
        await prisma.verificationCode.create({
            data: {
                userId: user.id,
                code,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
            }
        });

        // send verification email
        await axios.post(`${process.env.EMAIL_SERVICE_URL}/emails/send`, {
            recipient: user.email,
            subject: 'Email verification',
            body: `Your code is ${code}`,
            source: 'user-registration'
        });

        res.status(201).json(user);
        return;
    } catch (error) {
        next(error);
    }
};

export default userRegistration;