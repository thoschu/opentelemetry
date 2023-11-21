import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Instrumentation } from '@opentelemetry/instrumentation';
import { W3CBaggagePropagator, W3CTraceContextPropagator, CompositePropagator } from '@opentelemetry/core'

const start: (serviceName: string) => void = (serviceName: string): void => {
    const autoInstrumentations: Instrumentation[] = getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
            headersToSpanAttributes: {
                client: {
                    requestHeaders: ['tracestate', 'traceparent', 'baggage']
                },
                server: {
                    requestHeaders: ['tracestate', 'traceparent', 'baggage']
                }
            }
        }
    });
    const instrumentations: Instrumentation[][] = [autoInstrumentations];
    const url: string = 'http://jaeger:4318/v1/traces';
    const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({ url });

    const sdk: NodeSDK = new NodeSDK({
        traceExporter,
        serviceName,
        instrumentations,
        textMapPropagator: new CompositePropagator({
            propagators:[
                new W3CTraceContextPropagator(),
                new W3CBaggagePropagator()
            ]
        })
    });

    sdk.start();
}

export default start;
