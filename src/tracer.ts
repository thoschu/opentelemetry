import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations, InstrumentationConfigMap } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Instrumentation } from '@opentelemetry/instrumentation';

const start: (serviceName: string) => void = (serviceName: string): void => {
    const inputConfigs: InstrumentationConfigMap = {
        // https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/instrumentation-fs
        '@opentelemetry/instrumentation-fs': { enabled: false }
    };
    const autoInstrumentations: Instrumentation[] = getNodeAutoInstrumentations(inputConfigs);
    const instrumentations: Instrumentation[][] = [autoInstrumentations];
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
