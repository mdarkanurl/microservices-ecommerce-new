import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { User } from "../generated/prisma";

const getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const field = req.query.field as string;
        let user: User | null;

        if(field === 'authUserId') { // http://localhost:3003/users/thearkan?field=authUserId
            user = await prisma.user.findUnique({
                where: { authUserId: id }
            });
        } else {
            user = await prisma.user.findUnique({ where: { id } });
        }

        if(!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json(user);
        return;
    } catch (error) {
        next(error);
    }
}

export default getUserById;