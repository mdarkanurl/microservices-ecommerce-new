import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { InventoryUpdateDTOSchema } from "../schemas";

const updateInventory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Check if the inventory exists
        const { id } = req.params;
        const inventory = await prisma.inventory.findUnique({
            where: { id }
        });

        if(!inventory) {
            res.status(404).json({ message: 'Inventory not found' });
            return;
        }

        // update the inventory
        const parsedBody = InventoryUpdateDTOSchema.safeParse(req.body);

        if(!parsedBody.success) {
            res.status(400).json(parsedBody.error.errors);
            return;
        }

        const lastHistory = await prisma.history.findFirst({
            where: { inventoryId: id },
            orderBy: { createAt: 'desc' }
        });

        // Calculate the new quantity
        let newQuantity = inventory.quantity;
        if(parsedBody.data.actionType === 'IN') {
            newQuantity += parsedBody.data.quantity;
        } else if(parsedBody.data.actionType === 'OUT') {
            newQuantity -= parsedBody.data.quantity;
        } else {
            res.status(400).json({ Message: 'Invalid action type' });
            return;
        }

        // Update the inventory
        const updateInventory = await prisma.inventory.update({
            where: { id },
            data: {
                quantity: newQuantity,
                histories: {
                    create: {
                        actionType: parsedBody.data.actionType,
                        quantityChanged: parsedBody.data.quantity,
                        lastQuantity: lastHistory?.newQuantity || 0,
                        newQuantity
                    }
                }
            },
            select: {
                id: true,
                quantity: true
            }
        });

        res.status(200).json(updateInventory);
        return;
    } catch (error: any) {
        console.log(error);
        res.status(500).json(error);
    }
}

export default updateInventory;