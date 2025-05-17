import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma";
import { emailVerificationSchema } from "../schemas";
import axios from "axios";
import dotenv from "dotenv";
import { generateVerificationCode } from "../utils";
dotenv.config();

const verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // validate the request body
        const parseBody = emailVerificationSchema.safeParse(req.body);

        if(!parseBody.success) {
            res.status(400).json({ errors: parseBody.error.errors });
            return;
        }

        // check if the user with email exists
        const user = await prisma.user.findUnique({
            where: { email: parseBody.data.email }
        });

        if(!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // find the verification code
        const verificationCode = await prisma.verificationCode.findFirst({
            where: {
                id: user.id,
                code: parseBody.data.code
            }
        });

        if(!verificationCode) {
            res.status(404).json({ message: 'Invalid verification code' });
            return;
        }

        // If the code has expired
        if(verificationCode.expiresAt < new Date()) {
            res.status(400).json({ message: 'Verification code expired' });
            return;
        }

        // update user status to verified
        await prisma.user.update({
            where: { id: user.id },
            data: { verified: true, status: "ACTIVE" }
        });

        // update verification code status to used
        await prisma.verificationCode.update({
            where: { id: verificationCode.id },
            data: { status: 'USED', verifiedAt: new Date() }
        });

        // send success email
        await axios.post(`${process.env.EMAIL_SERVICE_URL}/emails/send`, {
            to: user.email,
            subject: 'Email verified',
            text: 'Your email has been verified successfully',
            source: 'verify-email'
        });

        res.status(200).json({ messgae: 'Email verified successfully' });
        return;
    } catch (error) {
        next(error);
    }
}

export default verifyEmail;