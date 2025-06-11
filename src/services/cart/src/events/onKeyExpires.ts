import nodeCron from 'node-cron';
import prisma from '../prisma';
import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();

function scheduleCrons() {
    nodeCron.schedule('*/1 * * * * *', async () => {
        console.log('Starting cron again');
        const expiredTime = new Date(); // This gets the current date and time
        expiredTime.setMinutes(expiredTime.getMinutes() - 15);

        const expiredCart = await prisma.cart.findMany({
            where: {
                createdAt: {
                    lt: expiredTime
                }
            }
        });

        if(expiredCart) {
            for (let i = 0; i < expiredCart.length; i++) {
                    await axios.put(`${process.env.INVENTORY_SERVICE_URL}/inventories/${expiredCart[i].inventoryId}`, {
                        quantity: expiredCart[i].quantity,
                        actionType: 'IN'
                    });                
            }

            await prisma.cart.deleteMany({
                where: {
                    createdAt: {
                        lt: expiredTime
                    }
                }
            })
        }
    });
}


export default scheduleCrons

// 8:20 now => then 8:02