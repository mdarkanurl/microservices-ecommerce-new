import { Request, Response, NextFunction } from "express";
import { cartItemSchema } from "../schema";
import { v4 as uuid } from "uuid";
import prisma from "../prisma";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const getMyCart = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req.cookies.guestUserId as string) || null;

        if(!userId) {
            res.status(200).json({ data: [] });
            return;
        }

        const cart = await prisma.cart.findMany({
            where: {
                id: userId
            }
        });

        if(!cart) {
            res.status(400).json({ message: 'your carts are expired' });
            return;
        }

        res.status(200).json({
            message: 'Here\'s the carts',
            data: cart
        });
    } catch (error) {
        next(error);
    }
}

export default getMyCart;