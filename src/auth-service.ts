import start from './tracer';
start('auth-service');

import express, { Express, Request, Response } from 'express';
import Redis from 'ioredis';
import { trace, Tracer, Span } from '@opentelemetry/api';

const port: string | number = process.env.PORT || 8082;
const redis: Redis = new Redis({ host: 'redis' });
const app: Express = express();

app.get('/auth',async (req: Request, res: Response): Promise<void> => {
    const names: string[] = await redis.keys('user:*');
    const min: 0 = 0;
    const max: number = names.length - 1;
    const index: number = Math.floor(Math.random() * (max - min + 1)) + min;
    const redisResult: string = await redis.get(`${names[index]}`);
    const user: Record<'username' | 'password', string> = JSON.parse(redisResult);
    const { username: userId }: { username: string } = user;

    // trace.getActiveSpan().setAttribute('username', username);
    // trace.getActiveSpan().setAttribute('nonce', index);
    trace.getActiveSpan().setAttributes({ userId, nonce: index });

    res.json({ user });
});

app.listen(port,(): void => {
    console.info(`auth-service is up and running and listening on port ${port}`);
});

(async (): Promise<void> => {
    const tracer: Tracer = trace.getTracer('init user');

    await tracer.startActiveSpan('# Set default user items', async (span: Span): Promise<void> => {
        await Promise.all([
                redis.set('user:nonce', JSON.stringify({ username: 'Nobody', password: 'nope' })),
                redis.set('user:tom', JSON.stringify({ username: 'Tom', password: 'mama' })),
                redis.set('user:thomas', JSON.stringify({ username: 'Thomas', password: 'papa' })),
            ]
        );

        span.end();
    });
})();
