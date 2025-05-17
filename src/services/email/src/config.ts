import { config } from "dotenv";
config();

export const DEFAULT_SENDER_EMAIL = process.env.DEFAULT_SENDER_EMAIL || "mdarkanurl@gmail.com";
export const API_KEY = process.env.API_KEY;