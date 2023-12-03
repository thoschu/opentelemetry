import start from './tracer';
const etc: { meter: Meter; logger: Logger } = start('ui-service');

import express, { Express, NextFunction, Response, Request } from 'express';
import {Attributes, Histogram, Meter, context, trace, Span, Context} from '@opentelemetry/api';
import { Logger, SeverityNumber } from '@opentelemetry/api-logs';

const calls: Histogram<Attributes> = etc.meter.createHistogram('http-calls');
const app: Express = express();
const port: string | number = process.env.PORT || 8080;

app.use((req: Request, res: Response, next: NextFunction): void => {
    const startTime: number = Date.now();
    const activeContext: Context = context.active();
    const currentSpan: Span | undefined = trace.getSpan(activeContext);

    res.set('traceparent', currentSpan.spanContext().traceId);

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

app.use('/', express.static(__dirname + '/public'));

app.listen(port, (): void => {
    const logText: string = `ui-service is up and running and listening on port ${port}`;

    console.log(logText);

    etc.logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: 'INFO',
        body: logText,
        attributes: { 'log.type': 'LogRecord' },
    });
});
