import { Express, Request, Response } from "express";
import axios from "axios";
import config from "./config.json";

// Define a type for the HTTP methods we expect
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

export const createHandler = (hostName: string, path: string, method: string) => {
    return async (req: Request, res: Response) => {
        // console.log('Is it here');
        try {

            let url = `${hostName}${path}`;
            req.params && Object.keys(req.params).forEach((param) => {
                url = url.replace(`:${param}`, req.params[param]);
            });

            console.log('URL', url);

            const { data } = await axios({
                method,
                url: url,
                data: req.body
            });

            res.json(data);
        } catch (error) {
            if(error instanceof axios.AxiosError) {
                res.status(error.request?.status || 500).json(error.request?.data);
                return;
            }
            console.log(error);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
    }
}

export const configureRoutes = (app: Express) => {
    Object.entries(config.services).forEach(([_name, service]) => {
        const hostName = service.url;
        service.routes.forEach((route) => {
            route.methods.forEach((method) => {
                const handler = createHandler(hostName, route.path, method);
                app[method as HttpMethod](`/api${route.path}`, handler);
                // console.log('Is it here');
            });
        });
    });
};