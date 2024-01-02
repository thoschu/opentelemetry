import start from './tracer';
const etc: { meter: Meter; logger: Logger }  = start('todo-service');

import { IncomingHttpHeaders } from 'http';
import express, {Response, Request, Express, NextFunction} from 'express';
import cors from 'cors';
import axios, {AxiosResponse} from 'axios';
import { Redis } from 'ioredis';
import { prop } from 'ramda';
import { Attributes, Histogram, Meter } from '@opentelemetry/api';
import { Logger, SeverityNumber } from '@opentelemetry/api-logs';

const calls: Histogram<Attributes> = etc.meter.createHistogram('http-calls');
const sleep = (time: number) => new Promise((resolve: (args: void) => void): NodeJS.Timeout => setTimeout(resolve, time));
const redis: Redis = new Redis({host: 'redis'});
const app: Express = express();
const port: string | number = process.env.PORT || 8081;

app.use((req: Request, res: Response, next: NextFunction): void => {
    const startTime: number = Date.now();

    req.on('end',(): void=> {
        const endTime: number = Date.now();

        calls.record(endTime-startTime,{
            route: req.route?.path,
            status: res.statusCode,
            method: req.method,
            userAgent: req.headers['user-agent']
        });
    });

    next();
});

app.use(cors());

app.get('/todos', async (req: Request, res: Response): Promise<void> => {
    const { headers }: { headers: IncomingHttpHeaders } = req;
    const name: string | string[] = prop<'x-name', IncomingHttpHeaders>('x-name', headers);
    const password: string | string[]  = prop<'x-password', IncomingHttpHeaders>('x-password', headers);

    const user: AxiosResponse = await axios.get('http://auth:8082/auth',{ headers: { name, password } });
    const todoKeys: string[] = await redis.keys('todo:*');
    const todos: Record<string, unknown>[] = [];

    for (let i: number = 0; i < todoKeys.length; i++) {
        const todoItem: string | null = await redis.get(todoKeys[i]);

        if (todoItem) {
            todos.push(JSON.parse(todoItem));
        }
    }

    if (req.query['slow']) {
        await sleep(3000);
    }

    if (req.query['fail']) {
        console.error('Failing request -> really bad error !!!');

        try {
            throw new Error('Really bad error');
        } catch (error: unknown) {
            console.error(error);
            res.sendStatus(500);

            return;
        }
    }

    if(user.data.loggedIn) {
        res.json({todos, user: user.data, env: process.env.NODE_ENV});

        return;
    }

    res.json({todos: null, user: user.data, env: process.env.NODE_ENV});
});

app.get('/ping', (_req: Request, res: Response): void => {
    res.status(200).send('Ok')
});

app.listen(port, (): void => {
    const logText: string = `todo-service is up and running and listening on port ${port}`;

    console.log(logText);

    etc.logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: 'INFO',
        body: logText,
        attributes: { 'log.type': 'LogRecord' },
    });
});

(async (): Promise<void> => {
    await Promise.all([
        redis.set('todo:1', JSON.stringify({name: 'Install OpenTelemetry SDK!'})),
        redis.set('todo:2', JSON.stringify({name: 'Deploy OpenTelemetry Collector'})),
        redis.set('todo:3', JSON.stringify({name: 'Configure sampling rule'})),
        redis.set('todo:4', JSON.stringify({name: 'You are OpenTelemetry master!!!!'}))]
    );
})();
