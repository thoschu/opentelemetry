import otel from './src/tracer';
const { meter, logger: log }:  { meter: Meter, logger: any } = otel('ui-service');

import express, { Express, NextFunction, Response, Request } from 'express';
import morgan from 'morgan';
import { format, info, transports } from 'winston';
import { logger }  from 'express-winston';
import { engine } from 'express-handlebars';
import { Attributes, Histogram, Meter, trace, context, Span, SpanContext, Context } from '@opentelemetry/api';
import {SeverityNumber} from "@opentelemetry/api-logs";

const calls: Histogram<Attributes> = meter.createHistogram('http-calls');
const app: Express = express();
const port: string | number = process.env.PORT || 8080;

app.engine('handlebars', engine());

app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

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
app.use(logger({
    transports: [
        new transports.Console(),
        new transports.File({ level: 'verbose', filename: 'log.out' }),
        new transports.File({ filename: 'error.log', level: 'error' })
    ],
    format: format.combine(
        format.colorize(),
        format.json()
    ),
    meta: true,
    expressFormat: true,
    colorize: true,
    ignoreRoute: (req: Request, res: Response): boolean => { return false; }
}));
app.use(morgan('combined'));
app.use('/js', express.static(__dirname + '/public'));

app.get('/', (req: Request, res: Response): void => {
    const activeContext: Context = context.active();
    const currentSpan: Span = trace.getSpan(activeContext);
    const spanContext: SpanContext = currentSpan.spanContext();
    const version: string = '00';
    const spanId: string = spanContext.spanId;
    const traceId: string = spanContext.traceId;
    const traceFlags: number = spanContext.traceFlags;
    const sampleDecision: string = `0${traceFlags}`;
    const traceparent: string = `${version}-${traceId}-${spanId}-${sampleDecision}`;

    res.render('traceparent', { body : 'main', traceparent });

    info('info', traceparent);
});

app.listen(port, (): void => {
    const infoMessage: string = `ui-service is up and running and listening on port http://localhost:${port}`;

    console.info(infoMessage);

    log.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: 'TRACE',
        body: `ui-service: ${infoMessage}`,
        timestamp: Date.now()
    });
});
