# Running and using the OpenTelemetry collector with `traceparent` dynamically generated server side

https://opentelemetry.io/docs/instrumentation/js/getting-started/browser/

https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/opentelemetry-web/examples

---

## 🄰 Receivers and Exporters

https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver

https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter

### Configure the collector
Add the following content to `collector/config.yml`. E.g. to allow CORS.

```yml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318
        cors:
          allowed_origins:
            - http://localhost:8080
      grpc:
        endpoint: 0.0.0.0:4317
processors:
exporters:
  debug:
  prometheus:
    endpoint: "0.0.0.0:8889"
    send_timestamps: true
    namespace: otel
    const_labels:
      via: collector
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true
  loki:
    endpoint: "http://loki:3100/loki/api/v1/push"
    default_labels_enabled:
      exporter: true
      job: true
extensions:
  health_check:
service:
  extensions: [health_check]
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp/jaeger]
    metrics:
      receivers: [otlp]
      processors: []
      exporters: [prometheus]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug, loki]
```

--- 

## 🄱 Frontend/Browser

```typescript
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { BatchSpanProcessor, WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { Resource } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Attributes, Counter, Histogram, Meter } from '@opentelemetry/api';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { Logger, logs, SeverityNumber } from '@opentelemetry/api-logs';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const serviceName: string = 'front-end';

// LOGS
const loggerProvider: LoggerProvider = new LoggerProvider({
    resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName })
});

const logExporter: OTLPLogExporter = new OTLPLogExporter({
    url: 'http://localhost:4318/v1/logs', concurrencyLimit: 1
});

const logProcessor: SimpleLogRecordProcessor = new SimpleLogRecordProcessor(logExporter);

loggerProvider.addLogRecordProcessor(logProcessor);

logs.setGlobalLoggerProvider(loggerProvider);
const logger: Logger = logs.getLogger(serviceName);

logger.emit({
    severityNumber: SeverityNumber.TRACE,
    severityText: 'TRACE',
    body: 'this is a log body from frontend/browser',
    attributes: { 'log.type': 'LogRecord' }
});

// METRICS
const metricExporter: OTLPMetricExporter = new OTLPMetricExporter({
    url: 'http://localhost:4318/v1/metrics',
    headers: {},
    concurrencyLimit: 1,
});
const meterProvider: MeterProvider = new MeterProvider({
    resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName })
});

meterProvider.addMetricReader(new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 5000,
}));

const meter: Meter = meterProvider.getMeter('browser-meter');
const counter: Counter<Attributes> = meter.createCounter('test-counter');
const calls: Histogram<Attributes> = meter.createHistogram('http-calls-histogram');

counter.add(10, { 'foo': 'bar' });
calls.record(Date.now() - 2000,{
    route: '/test',
    status: '200',
    method: 'GET'
});

// TRACES
const tracerProvider: WebTracerProvider = new WebTracerProvider({
    resource: new Resource({
        'service.name': serviceName
    })
});

const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces'
});

tracerProvider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
tracerProvider.register({
    // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
    contextManager: new ZoneContextManager()
});

registerInstrumentations({
    instrumentations: [
        new DocumentLoadInstrumentation(),
        new UserInteractionInstrumentation(),
        new XMLHttpRequestInstrumentation()
    ],
    tracerProvider,
    meterProvider
});
```
## 🄲 Server

```typescript
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
```

---

![qr-code](./assets/demo-arch.png)
