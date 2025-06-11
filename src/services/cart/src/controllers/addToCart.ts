import { Request, Response, NextFunction } from "express";
import { cartItemSchema } from "../schema";
import { v4 as uuid } from "uuid";
import prisma from "../prisma";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const addToCart = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const parsedBody = cartItemSchema.safeParse(req.body);
        if(!parsedBody.success) {
            res.status(400).json({ errors: parsedBody.error.errors });
            return;
        }

        let userId = (req.cookies.guestUserId as string) || null;

        if(!userId) {
            userId = uuid();

            // set the session id to cookie
            res.cookie('guestUserId', userId);
        }

        // check if product available
        const product = await axios.get(
            `${process.env.PRODUCT_SERVICE_URL}/products/${parsedBody.data.productId}`
        );

        if(product.data.stock < parsedBody.data.quantity) {
            res.status(400).json({ message: `${parsedBody.data.quantity} amount of product doesn\'t available` });
            return;
        }

        await prisma.cart.create({
            data: {
                id: userId,
                productId: parsedBody.data.productId,
                inventoryId: parsedBody.data.inventoryId,
                quantity: parsedBody.data.quantity
            }
        });

        await axios.put(`${process.env.INVENTORY_SERVICE_URL}/inventories/${parsedBody.data.inventoryId}`, {
            quantity: parsedBody.data.quantity,
            actionType: 'OUT'
        });

        res.status(201).json({ message: 'Item added to cart', userId });
        return;
    } catch (error) {
        next(error);
    }
}

export default addToCart;