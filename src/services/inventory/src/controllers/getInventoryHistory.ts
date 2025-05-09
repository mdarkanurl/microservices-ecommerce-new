import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { InventoryUpdateDTOSchema } from "../schemas";

const getInventoryHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Check if the inventory exists
        const { id } = req.params;
        const inventory = await prisma.inventory.findUnique({
            where: { id },
            include: {
                histories: {
                    orderBy: {
                        createAt: 'desc'
                    }
                }
            }
        });

        if(!inventory) {
            res.status(404).json({ message: 'Inventory not found' });
            return;
        }

        res.status(200).json(inventory);
        return;
    } catch (error: any) {
        console.log(error);
        res.status(500).json(error);
    }
}

export default getInventoryHistory;