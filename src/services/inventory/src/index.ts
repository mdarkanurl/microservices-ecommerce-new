import express from "express";
import { config } from "dotenv";

import { createInventory, updateInventory, getInventoryById, getInventoryHistory } from "./controllers";

const app = express();
config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get('/inventory/:id/history', getInventoryHistory);
app.get('/inventory/:id', getInventoryById);
app.put('/inventory/:id', updateInventory);
app.post('/inventory', createInventory);

app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`);
});