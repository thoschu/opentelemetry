import start from './tracer';
const meter: Meter = start('todo-service');

import express, { NextFunction } from 'express';
import { Response, Request, Express } from 'express';
import axios, {AxiosResponse} from 'axios';
import Redis from 'ioredis';
import { Attributes, Histogram, Meter, Span, trace, propagation, Context, Baggage, context } from '@opentelemetry/api';
import { api } from '@opentelemetry/sdk-node';

const port: string | number = process.env.PORT || 8081;

const sleep = (time: number) => new Promise((resolve: (args: void) => void): NodeJS.Timeout => setTimeout(resolve, time));

const redis: Redis = new Redis({ host: 'redis' });
const app: Express = express();

const calls: Histogram<Attributes> = meter.createHistogram('http-calls');

app.use((req: Request, res: Response, next: NextFunction): void => {
    const startTime: number = Date.now();

    req.on('end',(): void => {
        const endTime: number = Date.now();

        calls.record(endTime - startTime,{
            route: req.route?.path,
            status: res.statusCode,
            method: req.method
        });
    });

    next();
})

app.get('/todos', async (req: Request, res: Response): Promise<void> => {
    const baggage: Baggage = propagation.createBaggage({
        'user.plan': {
            value: 'enterprise'
        }
    });
    const contextWithBaggage: Context = propagation.setBaggage(context.active(), baggage);
    // ---------------------- Context Propagation with Baggage----------------------
    await context.with(contextWithBaggage, async (): Promise<void> => {
        const user: AxiosResponse = await axios.get('http://auth:8082/auth');
        const todoKeys: string[] = await redis.keys('todo:*');
        const todos: any = [];

        for (let i: number = 0; i < todoKeys.length; i++) {
            const todoItem: string | null = await redis.get(todoKeys[i]);

            if (todoItem) {
                todos.push(JSON.parse(todoItem));
            }
        }

        if(req.query['slow']) {
            await sleep(1000);
        }


        if(req.query['fail']) {
            console.error('Failing request -> really bad error !!!');
            try {
                throw new Error('Really bad error');
            } catch (error: any) {
                const activeSpan: Span | undefined = api.trace.getSpan(api.context.active());
                activeSpan?.recordException(error);

                console.error('Really bad error', {
                    spanId: activeSpan?.spanContext().spanId,
                    traceId: activeSpan?.spanContext().traceId,
                    traceFlags: activeSpan?.spanContext().traceFlags,
                    traceState: activeSpan?.spanContext().traceState,
                    isRemote: activeSpan?.spanContext().isRemote,
                });

                res.sendStatus(500);
                return;
            }
        }

        res.json({ todos, user: user.data, env: process.env.NODE_ENV });
    });
})

app.listen(port, (): void => {
    console.log(`todo-service is up and running and listening on port ${port}`);
})

async function init(): Promise<void> {
    // ---------------------- Manual Spans ----------------------
   await trace.getTracer('init-redis').startActiveSpan('Set default items', async (span: Span): Promise<void> => {
        await Promise.all([
            redis.set('todo:1', JSON.stringify({ name: 'Install OpenTelemetry SDK!' })),
            redis.set('todo:2', JSON.stringify({ name: 'Deploy OpenTelemetry Collector' })),
            redis.set('todo:3', JSON.stringify({ name: 'Configure sampling rule' })),
            redis.set('todo:4', JSON.stringify({ name: 'You are OpenTelemetry master!!!!' }))]
        );

        span.end(Date.now())
    });
}
init();
