import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { config } from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { addToCart, getMyCart } from './controllers';
import './events/onKeyExpires';

config();

const app = express();

// security middleware
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    handler: (_req, res) => {
        res
            .status(429)
            .json({ message: 'To many requests, please try again later' });
    }
});

app.use('/api', limiter);

// request logger
app.use(morgan('dev'));
app.use(express.json());

// routes
app.post('/cart/add-to-cart', addToCart);
app.get('/cart/my-cart', getMyCart);

// health check
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ message: 'API is running' });
});

app.use((err: ErrorRequestHandler, _req: Request, res: any, _next: NextFunction) => {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 4006;
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});