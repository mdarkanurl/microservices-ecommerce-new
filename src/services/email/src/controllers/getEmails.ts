import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

const getEmails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const emails = await prisma.email.findMany();
        res.status(200).json(emails);
        return;
    } catch (error) {
        next(error);
    }
}

export default getEmails;