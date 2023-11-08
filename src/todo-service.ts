import start from './tracer';
start('todo-service');

import express, { Response, Request, Express } from 'express';
import axios, { AxiosResponse } from 'axios';
import { Redis } from 'ioredis';
import { Span, trace } from '@opentelemetry/api';

const port: string | number = process.env.PORT || 8081;
const sleep: (time: number) => Promise<void> = (time: number) => new Promise((resolve: (args: void) => void): NodeJS.Timeout => setTimeout(resolve, time));
const redis: Redis = new Redis({host: 'redis'});
const app: Express = express();

app.get('/todos', async (req: Request, res: Response): Promise<void> => {
    const user: AxiosResponse = await axios.get('http://auth:8082/auth');
    const todoKeys: string[] = await redis.keys('todo:*');
    const todos: Record<'name', string>[] = [];

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

            const exceptionError: Error = <Error>error;

            res.status(500).send( { name: exceptionError.name, stack: exceptionError.stack, message: exceptionError.message } );

            return;
        }
    }

    res.json({ todos, user: user.data });
})

app.listen(port, (): void => {
    console.log(`todo-service is up and running and listening on port ${port}`);
});


(async (): Promise<void> => {
    await trace.getTracer('init todo').startActiveSpan('# Set default todo items', async (span: Span): Promise<void> => {
        await Promise.all([
            redis.set('todo:1', JSON.stringify({name: 'Install OpenTelemetry SDK!'})),
            redis.set('todo:2', JSON.stringify({name: 'Deploy OpenTelemetry Collector'})),
            redis.set('todo:3', JSON.stringify({name: 'Configure sampling rule'})),
            redis.set('todo:4', JSON.stringify({name: 'You are OpenTelemetry master!!!!'}))]
        );

        span.end();
    });
})();
