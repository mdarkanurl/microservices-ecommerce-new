import express from "express";
import { config } from "dotenv";
import { getProducts, getProductHistory, createProduct } from "./controllers";

const app = express();
config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router
app.post('/products', createProduct)
app.get('/products', getProducts)
app.get('/products/:id', getProductHistory)

app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`);
});