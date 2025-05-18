import { Express, Request, Response } from "express";
import config from "./config.json";
import axios from "axios";
import middlewares from "./middlewares";

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
                    origin: "http://localhost:3000",
                    'x-user-id': req.headers['x-user-id'] || '',
                    'x-user-email': req.headers['x-user-email'] || '',
                    'x-user-name': req.headers['x-user-name'] || '',
                    'x-user-role': req.headers['x-user-role'] || '',
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
};

const getMiddlewares = (names: string[]) => {
    return names.map((name) => middlewares[name]);
}

export const  configureRoutes = (app: Express) => {
    Object.entries(config.services).forEach(([_name, service]) => {
        const hostname = service.url;
        service.routes.forEach(route => {
            route.methods.forEach(method => {
                const middleware = getMiddlewares(route.middlewares);
                const handler = createHandler(hostname, route.path, method);
                app[method as httpMethod](`/api${route.path}`, middleware, handler);             
            });
        });
    });
};