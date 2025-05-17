import express from "express";
import { config } from "dotenv";
import { getProducts, getProductHistory, createProduct } from "./controllers";

const app = express();
config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares
// app.use((req, res, next) => {
//     const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
//     const origin = req.headers.origin || '';

//     if(allowedOrigins.includes(origin)) {
//         res.setHeader('Access-Control-Allow-Origin', origin);
//         next();
//     } else {
//         res.status(403).json({ message: 'Forbidden' });
//     }
// });

// Router
app.post('/products', createProduct)
app.get('/products', getProducts)
app.get('/products/:id', getProductHistory)

app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`);
});