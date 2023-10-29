import start from './tracer';
const meter: Meter = start('auth-service');

import { IncomingHttpHeaders } from 'http';
import express, {Express, NextFunction, Request, Response} from 'express';
import { Redis } from 'ioredis';
import { isNotNil, prop } from 'ramda';
import { Attributes, Histogram, Meter } from '@opentelemetry/api';

const calls: Histogram<Attributes> = meter.createHistogram('http-calls');
const app: Express = express();
const port: string | number = process.env.PORT || 8082;
const redis: Redis = new Redis({ host: 'redis' });

type User = Record<'username' | 'password', string | number>;

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

app.get('/auth', async (req: Request, res: Response): Promise<void> => {
    const { headers }: { headers: IncomingHttpHeaders } = req;
    const name: string = <string>prop<'name', IncomingHttpHeaders>('name', headers) || 'nonce';
    const password: string = <string>prop<'password', IncomingHttpHeaders>('password', headers) || 'nope';
    const redisResult: string = await redis.get(`user:${name.toLowerCase()}`);
    const redisResultParsed: User = JSON.parse(isNotNil(redisResult) ? redisResult : JSON.stringify({ username: null, password: null }));
    const loggedIn: boolean = redisResultParsed.password === password;

    res.json({ loggedIn, redisResultParsed, headers: req.headers });
});

app.listen(port,(): void => {
    console.info(`auth-service is up and running and listening on port ${port}`);
});

(async (): Promise<void> => {
    await Promise.all([
            redis.set('user:nonce', JSON.stringify({ username: 'Nobody', password: 'nope' })),
            redis.set('user:tom', JSON.stringify({ username: 'Tom', password: 'mama' })),
            redis.set('user:thomas', JSON.stringify({ username: 'Thomas', password: 'papa' })),
        ]
    );
})();
