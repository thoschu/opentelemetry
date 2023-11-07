import start from './tracer';
start('todo-service');

import { Context, Exception, Span } from '@opentelemetry/api';
import { api } from '@opentelemetry/sdk-node';
import { IncomingHttpHeaders } from 'http';
import express, { Response, Request, Express } from 'express';
import cors from 'cors';
import axios, {AxiosResponse} from 'axios';
import { Redis } from 'ioredis';
import { prop } from 'ramda';

const port: string | number = process.env.PORT || 8081;
const sleep = (time: number) => new Promise((resolve: (args: void) => void): NodeJS.Timeout => setTimeout(resolve, time));
const redis: Redis = new Redis({host: 'redis'});
const app: Express = express();

app.use(cors())

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
        await sleep(1000);
    }


    if (req.query['fail']) {
        console.error('Failing request -> really bad error !!!');

        try {
            throw new Error('Really bad error');
        } catch (error: unknown) {
            const ctx: Context = api.context.active();
            const activeSpan: Span = api.trace.getSpan(ctx);
            const errorParams: { spanId: string; traceId: string; traceFlag: number; error: unknown; } = {
                spanId: activeSpan?.spanContext().spanId,
                traceId: activeSpan?.spanContext().traceId,
                traceFlag: activeSpan?.spanContext().traceFlags,
                error
            };

            activeSpan?.recordException(<Exception>error);

            console.error('Really bad error!', errorParams);

            res.status(500).send(errorParams);

            return;
        }
    }

    if(user.data.loggedIn) {
        res.json({ todos, user: user.data, env: process.env.NODE_ENV });

        return;
    }

    res.json({ todos: null, user: user.data, env: process.env.NODE_ENV });
})

app.listen(port, (): void => {
    console.log(`todo-service is up and running and listening on port ${port}`);
});

(async (): Promise<void> => {
    await Promise.all([
        redis.set('todo:1', JSON.stringify({name: 'Install OpenTelemetry SDK!'})),
        redis.set('todo:2', JSON.stringify({name: 'Deploy OpenTelemetry Collector'})),
        redis.set('todo:3', JSON.stringify({name: 'Configure sampling rule'})),
        redis.set('todo:4', JSON.stringify({name: 'You are OpenTelemetry master!!!!'}))]
    );
})();
