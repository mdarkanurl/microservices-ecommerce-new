import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { InventoryCreateDTOSchema } from "../schemas";

const createInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate req body
        const parsedBody = InventoryCreateDTOSchema.safeParse(req.body);
        if(!parsedBody.success) {
            res.status(400).json({ error: parsedBody.error });
            return;
        }

        // create inventory
        const inventory = await prisma.inventory.create({
            data: {
                ...parsedBody.data,
                histories: {
                    create: {
                        actionType: 'IN',
                        quantityChanged: parsedBody.data.quantity,
                        lastQuantity: 0,
                        newQuantity: parsedBody.data.quantity
                    }
                }
            },
            select: {
                id: true,
                quantity: true
            }
        });

        res.status(201).json(inventory);
        return;
    } catch (error: any) {
        console.log(error);
        res.status(500).json(error);
    }
}

export default createInventory;