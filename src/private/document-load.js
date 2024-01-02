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

const serviceName = 'front-end';

// --------------------------------------------------------------------------------
// LOGS ---------------------------------------------------------------------------
// --------------------------------------------------------------------------------
const loggerProvider = new LoggerProvider({
    resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName })
});

const logExporter = new OTLPLogExporter({
    url: 'http://localhost:4318/v1/logs', concurrencyLimit: 1
});

const logProcessor = new SimpleLogRecordProcessor(logExporter);

loggerProvider.addLogRecordProcessor(logProcessor);

logs.setGlobalLoggerProvider(loggerProvider);
const logger = logs.getLogger(serviceName);

logger.emit({
    severityNumber: SeverityNumber.TRACE,
    severityText: 'TRACE',
    body: 'this is a log body from frontend/browser',
    attributes: { 'log.type': 'LogRecord' }
});

// -----------------------------------------------------------------------------------
// METRICS ---------------------------------------------------------------------------
// -----------------------------------------------------------------------------------
const metricExporter = new OTLPMetricExporter({
    url: 'http://localhost:4318/v1/metrics',
    headers: {},
    concurrencyLimit: 1,
});
const meterProvider = new MeterProvider({
    resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName })
});

meterProvider.addMetricReader(new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 5000,
}));

const meter = meterProvider.getMeter('browser-meter');
const counter= meter.createCounter('test-counter');
const calls = meter.createHistogram('http-calls-histogram');

counter.add(10, { 'foo': 'bar' });

calls.record(Date.now() - 2000,{
    route: '/test',
    status: '200',
    method: 'GET'
});

// ----------------------------------------------------------------------------------
// TRACES ---------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
const tracerProvider = new WebTracerProvider({
    resource: new Resource({
        'service.name': serviceName
    })
});

const traceExporter = new OTLPTraceExporter({
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
    meterProvider,
});
