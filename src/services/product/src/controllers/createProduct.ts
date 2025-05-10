import axios from "axios";
import { config } from "dotenv";
config();
import { ProductCreateDTOSchema } from "../schemas";
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL;
import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Validate request body
        const parsedBody = ProductCreateDTOSchema.safeParse(req.body);

        if(!parsedBody.success) {
            res
                .status(400)
                .json({ message: 'Invalid request body', error: parsedBody.error.errors });
            return;
        }

        // Check if product with same sju already exists
        const existingProduct = await prisma.product.findFirst({
            where: {
                sku: parsedBody.data.sku
            }
        });

        if(existingProduct) {
            res
                .status(400)
                .json({ message: 'Product with the same SKU already exists' });
            return;
        }

        // Create product
        const product = await prisma.product.create({
            data: parsedBody.data
        });

        const { data: inventory } = await axios.post(`${INVENTORY_SERVICE_URL}/inventory`, {
            productId: product.id,
            sku: product.sku
        });

        // update product and store inventory id
        await prisma.product.update({
            where: { id: product.id },
            data: {
                inventoryId: inventory.id
            }
        });

        res.status(201).json({ ...product, inventoryId: inventory.id });
        return;
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

export default createProduct;