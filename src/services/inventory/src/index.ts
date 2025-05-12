import express from "express";
import { config } from "dotenv";

import { createInventory, updateInventory, getInventoryById, getInventoryHistory } from "./controllers";

const app = express();
config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get('/inventories/:id/history', getInventoryHistory);
app.get('/inventories/:id', getInventoryById);
app.put('/inventories/:id', updateInventory);
app.post('/inventories', createInventory);

app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`);
});