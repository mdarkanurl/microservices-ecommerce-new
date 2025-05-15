import express from "express";
import { config } from "dotenv";
import { userLogin, userRegistration, verifyToken } from "./controllers";

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
app.post('/auth/registration', userRegistration);
app.post('/auth/login', userLogin);
app.post('/auth/verify-token', verifyToken);

app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`);
});