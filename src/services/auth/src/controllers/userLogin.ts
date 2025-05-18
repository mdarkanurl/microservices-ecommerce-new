import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserLoginSchema } from "../schemas";
import { LoginAttempt } from "../generated/prisma";
dotenv.config();

type LoginHistory = {
    userId: string;
    userAgent: string | undefined;
    ipAddress: string | undefined;
    attempt: LoginAttempt;
}

const createLoginHistory = async (info: LoginHistory) => {
    await prisma.loginHistory.create({
        data: {
            userId: info.userId,
            userAgent: info.userAgent,
            ipAddress: info.ipAddress,
            attempt: info.attempt,
        }
    });
}

const userLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const ipAddress = req.headers['x-forwarded-for'] as string || req.ip || '';
        const userAgent = req.headers['user-agent'] || '';

        // Validate the request body
        const parseBody = UserLoginSchema.safeParse(req.body);

        if(!parseBody.success) {
            res.status(400).json({ errors: parseBody.error.errors });
            return;
        }

        // check if the user exists
        const user = await prisma.user.findUnique({
            where: { email: parseBody.data.email }
        });

        if(!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        // compare the password
        const isMatch = await bcrypt.compare(parseBody.data.password, user.password);

        if(!isMatch) {
            await createLoginHistory({
                userId: user.id,
                userAgent,
                ipAddress,
                attempt: "FAILED"
            });
            res.status(40).json({ message: 'Invalid credentials' });
            return;
        }

        // check if the user is verified
        if(!user.verified) {
            await createLoginHistory({
                userId: user.id,
                userAgent,
                ipAddress,
                attempt: "FAILED"
            });
            res.status(400).json({ message : 'User not verified'});
            return;
        }

        // check if the account is active

        if(user.status !== 'ACTIVE') {
            await createLoginHistory({
                userId: user.id,
                userAgent,
                ipAddress,
                attempt: "FAILED"
            });
            res.status(400).json({ message: `Your account is ${user.status.toLowerCase()}` });
            return;
        }

        // generate access token
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET ?? 'My-JWT_SECRET',
            { expiresIn: '2h' }
        );

        await createLoginHistory({
                userId: user.id,
                userAgent,
                ipAddress,
                attempt: "SUCCESS"
            });

        res.status(200).json({ accessToken });
        return;
    } catch (error) {
        next(error);
    }
}

export default userLogin;