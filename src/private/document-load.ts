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

// METRICS
const metricExporter: OTLPMetricExporter = new OTLPMetricExporter({
    url: 'http://localhost:4318/v1/metrics',
    headers: {},
    concurrencyLimit: 1,
});
const meterProvider: MeterProvider = new MeterProvider({
    resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: 'plain-browser' })
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
const hostname: string = 'front-end';
const tracerProvider: WebTracerProvider = new WebTracerProvider({
    resource: new Resource({
        'host.name': hostname
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
