# Running and using the OpenTelemetry collector with logging

https://github.com/open-telemetry/opentelemetry-collector-contrib

https://opentelemetry.io/docs/instrumentation/js/exporters/

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

---

![qr-code](./assets/demo-arch.png)
