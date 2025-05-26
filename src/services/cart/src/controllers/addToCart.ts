import { Request, Response, NextFunction } from "express";
import { cartItemSchema } from "../schema";
import { v4 as uuid } from "uuid";
import redis from "../redis";
// import { CART_TTL, INVENTORY_SERVICE_URL } from "../config";
// import axios from "axios";

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

        let userId = (req.cookies.userId as string) || null;

        if(!userId) {
            userId = uuid();

            // set the session id to cookie
            res.cookie('guest-user-id', userId);
        }

        const cartData = {
            items: [
                {
                    productId: parsedBody.data.productId, inventoryId: parsedBody.data.inventoryId, quantity: 2
                }
            ],
            userId: userId
        };

        await redis.set(`guest-user-id:${userId}`, JSON.stringify(cartData), {
            EX: 60
        });
        
        res.status(201).json({ message: 'Item added to cart', userId });
        return;
    } catch (error) {
        next(error);
    }
}

export default addToCart;