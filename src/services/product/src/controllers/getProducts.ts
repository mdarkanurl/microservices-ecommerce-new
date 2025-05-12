import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                sku: true,
                name: true,
                price: true,
                inventoryId: true
            }
        });

        res.json({ data: products });
        return;
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
        return;
    }
}

export default getProducts;