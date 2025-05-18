import { Express, Request, Response } from "express";
import config from "./config.json";
import axios from "axios";

// Define a type for the HTTP methods we expect
type httpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

const createHandler = (hostname: string, path: string, method: string) => {
    return async (req: Request, res: Response) => {
        try {
            let url = `${hostname}${path}`;

            req.params && Object.keys(req.params).forEach(param => {
                url = url.replace(`:${param}`, req.params[param]);
            });

            const { data } = await axios({
                method,
                url,
                data: req.body,
                headers: {
                    origin: "http://localhost:3000"
                }
            });

            res.json(data);
        } catch (error) {
            if(error instanceof axios.AxiosError) {
                res
                    .status(error.response?.status || 500)
                    .json(error.response?.data);
                return;
            }
            console.log(error);
            res.status(500).json({ Message: 'Internal server error' });
            return;
        }
    }
}

export const  configureRoutes = (app: Express) => {
    Object.entries(config.services).forEach(([_name, service]) => {
        const hostname = service.url;
        service.routes.forEach(route => {
            route.methods.forEach(method => {
                const handler = createHandler(hostname, route.path, method);
                app[method as httpMethod](`/api${route.path}`, handler);             
            });
        });
    });
};