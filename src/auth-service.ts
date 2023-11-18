import start from './tracer';
const meter: Meter = start('auth-service');
const calls: Histogram<Attributes> = meter.createHistogram('http-calls');

import express, { Express, NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';
import { Attributes, Histogram, Meter } from '@opentelemetry/api';

const port: string | number = process.env.PORT || 8082;
const redis: Redis = new Redis({ host: 'redis' });
const app: Express = express();

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

app.get('/auth',async (req: Request, res: Response): Promise<void> => {
    const names: string[] = await redis.keys('user:*');
    const min: 0 = 0;
    const max: number = names.length - 1;
    const index: number = Math.floor(Math.random() * (max - min + 1)) + min;
    const redisResult: string = await redis.get(`${names[index]}`);
    const user: Record<'username' | 'password', string> = JSON.parse(redisResult);

    res.json({ user });
});

app.listen(port,(): void => {
    console.info(`auth-service is up and running and listening on port ${port}`);
});

(async (): Promise<void> => {
    await Promise.all([
            redis.set('user:nonce', JSON.stringify({username: 'Nobody', password: 'nope'})),
            redis.set('user:tom', JSON.stringify({username: 'Tom', password: 'mama'})),
            redis.set('user:thomas', JSON.stringify({username: 'Thomas', password: 'papa'})),
        ]
    );
})();
