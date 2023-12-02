import { BatchSpanProcessor, WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { LongTaskInstrumentation, ObserverCallbackInformation } from '@opentelemetry/instrumentation-long-task';
import { Span } from '@opentelemetry/api';


const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces'
});

const provider: WebTracerProvider = new WebTracerProvider({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'browser'
    })
});

provider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

provider.register({
    contextManager: new ZoneContextManager()
});

// Registering instrumentations
registerInstrumentations({
    instrumentations: [
        new DocumentLoadInstrumentation(),
        new FetchInstrumentation(),
        new UserInteractionInstrumentation(),
        new XMLHttpRequestInstrumentation(),
        new LongTaskInstrumentation({
            observerCallback: (span: Span, longtaskEvent: ObserverCallbackInformation): void => {
                console.log(longtaskEvent);
                span.setAttribute('location.pathname', window.location.pathname)
            }
        })
    ]
});


const xhr: XMLHttpRequest = new XMLHttpRequest();
xhr.open('POST', 'http://localhost:4318/v1/logs', true);
xhr.setRequestHeader('Content-Type', 'application/json');

const logData: { message: string, timestamp: string } = {
    message: "Dies ist eine Log-Nachricht",
    timestamp: new Date().toISOString()
};

xhr.send(JSON.stringify(logData));
