import start from './tracer';
const meter: Meter = start('auth-service');

import express from 'express';
import { Express, Request, Response } from 'express';
import { Meter, trace, propagation, Baggage } from '@opentelemetry/api';
const app: Express = express();

app.get('/auth',(req: Request, res: Response): void => {
    const baggage: Baggage = propagation.getActiveBaggage();
    const user: { username: string, id: number } = { username: 'Tom S...', id: 1377 };
    console.log(baggage.getAllEntries());

    trace.getActiveSpan()?.setAttribute('userId', user.id);
    trace.getActiveSpan()?.setAttributes({
        foo: 1,
        bar: true,
        baz: user.username,
        xxx: req.originalUrl
    });

    res.json({ user, baggage: baggage.getAllEntries(), headers: req.headers });
});

app.listen(8082, (): void => {
    console.log('service is up and running!');
});
