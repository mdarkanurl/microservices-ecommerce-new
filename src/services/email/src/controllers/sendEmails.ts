import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { emailCreateSchema } from "../schemas";
import { sendEmailFunc } from "../utils";
import { DEFAULT_SENDER_EMAIL } from "../config";

const sendEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Validate the request body
        const parseBody = emailCreateSchema.safeParse(req.body);

        if(!parseBody.success) {
            res.status(400).json({ errors: parseBody.error.errors });
            return;
        }

        // create mail option
        const { sender, recipient, subject, body, source } = parseBody.data;
        const from = sender || DEFAULT_SENDER_EMAIL;
        await sendEmailFunc(from, recipient, subject, body);

        // send the email
        await prisma.email.create({
            data: {
                sender: from,
                recipient,
                subject,
                body,
                source
            }
        });

        res.status(200).json({ message: 'Email sent' });
        return;
    } catch (error) {
        next(error);
    }
}

export default sendEmail;