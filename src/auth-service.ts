import start from './tracer';
start('auth-service');

import { IncomingHttpHeaders } from 'http';
import express, { Express, Request, Response } from 'express';
import { Redis } from 'ioredis';
import { isNotNil, prop } from 'ramda';

const port: string | number = process.env.PORT || 8082;
const app: Express = express();
const redis: Redis = new Redis({ host: 'redis' });

type User = Record<'username' | 'password', string | number>;

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
