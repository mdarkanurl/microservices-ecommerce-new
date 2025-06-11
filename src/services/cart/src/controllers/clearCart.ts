import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const clearCart = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req.cookies.guestUserId as string) || null;

        if(!userId) {
            res.status(200).json({ message: 'Cart is empty' });
            return;
        }

        const carts = await prisma.cart.findMany({
            where: {
                idUn: userId
            }
        });

        if(!carts) {
            res.status(400).json({ message: 'your carts are expired' });
            return;
        }

        await prisma.cart.deleteMany({
            where: {
                idUn: userId
            }
        });

        for (let i = 0; i < carts.length; i++) {
                await axios.put(`${process.env.INVENTORY_SERVICE_URL}/inventories/${carts[i].inventoryId}`, {
                quantity: carts[i].quantity,
                actionType: 'IN'
            });

        }

        res.status(200).json({ messgae: 'Cart successfully cleared' });
    } catch (error) {
        next(error);
    }
}

export default clearCart;