import express from "express";
import { config } from "dotenv";

const app = express();
config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`);
});