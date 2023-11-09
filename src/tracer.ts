import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations, InstrumentationConfigMap } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Instrumentation } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';

const start: (serviceName: string) => void = (serviceName: string): void => {
    const inputConfigs: InstrumentationConfigMap = {};
    const autoInstrumentations: Instrumentation[] = getNodeAutoInstrumentations(inputConfigs);
    const instrumentations: Instrumentation[][] = [autoInstrumentations];
    const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({
        url: 'http://jaeger:4318/v1/traces',
    });

    const sdk: NodeSDK = new NodeSDK({
        traceExporter,
        serviceName,
        instrumentations,
        autoDetectResources: true,
        resource: new Resource({
            'code.owner': 'core-team',
            'deployment': '4'
        }),
    });

    sdk.start();
}

export default start;
