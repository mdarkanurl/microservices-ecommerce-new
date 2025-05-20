import { Request, Response, NextFunction } from "express";
import { cartItemSchema } from "../schema";
import { v4 as uuid } from "uuid";
import redis from "../redis";
import { CART_TTL, INVENTORY_SERVICE_URL } from "../config";
import axios from "axios";

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

        let cartSessionId = (req.headers['x-cart-session-id'] as string) || null;

		
        if(cartSessionId) {
            const exists = await redis.exists(`sessions:${cartSessionId}`);

            if(exists === 0) {
                cartSessionId = null;
            }
        }

        if(!cartSessionId) {
            cartSessionId = uuid();
            
            // set the session id to redis
            await redis.setex(`sessions:${cartSessionId}`, CART_TTL, cartSessionId);

            // set the session id to response header
            res.setHeader('x-cart-session-id', cartSessionId);
        }

        // check if the inventory is available
        const { data } = await axios.get(`${INVENTORY_SERVICE_URL}/inventory/${parsedBody.data.inventoryId}`);
        if(Number(data.quantity) < parsedBody.data.quantity) {
            res.status(400).json({ message: 'Inventory not available' });
            return;
        };

        // add item to the cart
        await redis.hset(`cart:${cartSessionId}`, parsedBody.data.productId, JSON.stringify({
            inventoryId: parsedBody.data.inventoryId,
            quantity: parsedBody.data.quantity,
        }));

        // update inventory
        await axios.put(`${INVENTORY_SERVICE_URL}/inventories/${parsedBody.data.inventoryId}`, {
            quantity: parsedBody.data.quantity,
            actionType: "OUT"
        });

        res.status(201).json({ message: 'Item added to cart', cartSessionId });
        return;
    } catch (error) {
        next(error);
    }
}

export default addToCart;