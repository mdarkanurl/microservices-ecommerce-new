import { Request, Response, NextFunction } from "express";
import prisma from '../prisma';
import axios from "axios";
import { config } from "dotenv";
config();
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL;

const getProductHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id }
        });

        if(!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        if(product.inventoryId === null) {
            const { data: inventory } = await axios.post(
                `${INVENTORY_SERVICE_URL}/inventories`,
                {
                    productId: product.id,
                    sku: product.sku
                }
            );

            await prisma.product.update({
                where: { id: product.id },
                data: {
                    inventoryId: inventory.id
                }
            });

            res.status(200).json({
                ...product,
                inventoryId: inventory.id,
                stock: inventory.quantity || 0,
                stockStatus: inventory.quantity > 0 ? 'In stock' : 'Out of stock'
            });
            return;
        }

        const { data: inventory } = await axios.get(
            `${INVENTORY_SERVICE_URL}/inventories/${product.inventoryId}`
        );

        res.status(200).json({
            ...product,
            stock: inventory.quantity || 0,
            stockStatus: inventory.quantity > 0 ? 'In stock' : 'Out of stock'
        })
    } catch (error) {
        next(error);
    }
}

export default getProductHistory;