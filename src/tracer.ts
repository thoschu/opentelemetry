import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Instrumentation } from '@opentelemetry/instrumentation';

const start: (serviceName: string) => void = (serviceName: string): void => {
    const instrumentations: Instrumentation[][] = [getNodeAutoInstrumentations()];
    const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({
        url: 'http://jaeger:4318/v1/traces',
    });

    const sdk: NodeSDK = new NodeSDK({
        traceExporter,
        serviceName,
        instrumentations
    });

    sdk.start();
}

export default start;
