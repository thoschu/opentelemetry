import start from './tracer';
const oTel: { meter: Meter; logger: Logger } = start('ui-service');

import express, { Express, NextFunction, Response, Request } from 'express';
import { Attributes, Histogram, Meter, context, trace, Span, Context, SpanContext } from '@opentelemetry/api';
import { Logger, SeverityNumber } from '@opentelemetry/api-logs';
import { engine } from 'express-handlebars';
import { info } from 'winston';

const calls: Histogram<Attributes> = oTel.meter.createHistogram('http-calls');
const app: Express = express();
const port: string | number = process.env.PORT || 8080;

app.engine('handlebars', engine());

app.set('view engine', 'handlebars');
app.set('views', __dirname + '/public/views');

app.use((req: Request, res: Response, next: NextFunction): void => {
    const startTime: number = Date.now();
    const activeContext: Context = context.active();
    const currentSpan: Span | undefined = trace.getSpan(activeContext);
    const spanContext: SpanContext = currentSpan.spanContext();
    const version: string = '00';
    const traceId: string = spanContext.traceId;
    const spanId: string  = spanContext.spanId;
    const sampleDecision: string = `${(spanContext.traceFlags === 1) ? '01' : '00'}`;
    const traceParent: string = `${version}-${traceId}-${spanId}-${sampleDecision}`

    req.headers['X-Trace-Parent'] = traceParent;

    req.on('end',(): void=> {
        const endTime: number = Date.now();

        calls.record(endTime-startTime,{
            route: req.route?.path,
            status: res.statusCode,
            method: req.method,
            userAgent: req.headers['user-agent'],
            traceParent
        });
    });

    next();
});

// app.use('/', express.static(__dirname + '/public'));

app.get('/', (req: Request, res: Response): void => {
    const traceparent: string | string[] = req.headers['X-Trace-Parent'];

    res.render('traceparent', { body : 'main', traceparent });

    info(traceparent);
});

app.get('/ping', (_req: Request, res: Response): void => {
    res.status(200).send('Ok')
});

app.listen(port, (): void => {
    const logText: string = `ui-service is up and running and listening on port ${port}`;

    info(logText);

    oTel.logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: 'INFO',
        body: logText,
        attributes: { 'log.type': 'LogRecord' },
    });
});
