import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { BufferConfig } from '@opentelemetry/sdk-trace-base/build/src/types';

const start: (serviceName: string) => void = (serviceName: string): void => {
    const exporter: OTLPTraceExporter = new OTLPTraceExporter({
        url: 'http://jaeger:4318/v1/traces',
    });

    const bufferConfig: BufferConfig = {
        maxExportBatchSize: 1024,
        scheduledDelayMillis: 1000,
        exportTimeoutMillis: 10000,
        maxQueueSize: 1024
    };

    const sdk: NodeSDK = new NodeSDK({
        traceExporter: exporter,
        serviceName,
        instrumentations: [getNodeAutoInstrumentations()],
        spanProcessor: new BatchSpanProcessor(exporter, bufferConfig)
    });

    sdk.start();
}

export default start;
