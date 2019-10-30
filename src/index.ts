import "reflect-metadata";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import './dotenv'
import {Routes} from "./routes";
import { logger } from "./logger";
import bot, { initBot } from "./bot";
import { getDb } from "./db";

async function start() {
    const connection = await getDb()

    // create express app
    const app = express();
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next);
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });
    });

    await initBot()
    // setup express app here
    // this does NOT work with body-parser. Instead use custom route
    // app.use(bot.webhookCallback(`/${process.env.WEBHOOK_PATH}`))
    app.post(`/${process.env.WEBHOOK_PATH}`, (req, res) => {
        logger.debug(req.body)
        return bot.handleUpdate(req.body, res)
    })

    // start express server
    app.listen(3000);

    logger.info("Express server has started on port 3000. Open http://localhost:3000/info");
}

start().catch(error => logger.error(error.message || error));