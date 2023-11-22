import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'

const start: (serviceName: string) => void = (serviceName: string): void => {
    const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({
        url: 'http://jaeger:4318/v1/traces',
    });

    const sdk: NodeSDK = new NodeSDK({
        traceExporter,
        serviceName,
        instrumentations: [getNodeAutoInstrumentations()],
        spanProcessor: new SimpleSpanProcessor(traceExporter) ?? new BatchSpanProcessor(traceExporter)
    });

    sdk.start();
}

export default start;
