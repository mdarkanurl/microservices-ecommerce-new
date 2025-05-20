import { Request, Response, NextFunction } from "express";
import redis from "../redis";


const getMyCart = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const cartSessionId = (req.headers['x-cart-session-id'] as string) || null;

        if(!cartSessionId) {
            res.status(404).json({ message: 'Cart not found' });
            return;
        }

        const session = await redis.exists(`sessions:${cartSessionId}`);

        if(!session) {
            await redis.del(`cart:${cartSessionId}`);
            res.status(200).json({ data: [] });
            return;
        }

        const cart = await redis.hgetall(`cart:${cartSessionId}`);
        res.status(200).json({ data: cart });
        return;
    } catch (error) {
        next(error);
    }
}

export default getMyCart;