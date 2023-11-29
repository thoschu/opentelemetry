import start from './tracer';
const etc: { meter: Meter; logger: Logger } = start('ui-service');

import express, { Express, NextFunction, Response, Request } from 'express';
import { Attributes, Histogram, Meter } from '@opentelemetry/api';
import {Logger} from "@opentelemetry/api-logs";

const calls: Histogram<Attributes> = etc.meter.createHistogram('http-calls');
const app: Express = express();
const port: string | number = process.env.PORT || 8080;

app.use((req: Request, res: Response, next: NextFunction): void => {
    const startTime: number = Date.now();

    req.on('end',(): void=> {
        const endTime: number = Date.now();

        calls.record(endTime-startTime,{
            route: req.route?.path,
            status: res.statusCode,
            method: req.method
        });
    });

    next();
});

app.use('/', express.static(__dirname + '/public'));

app.listen(port, (): void => {
    console.log(`Example app listening on port ${port}`);
});
