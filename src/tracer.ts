import {NodeSDK, NodeSDKConfiguration} from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations, InstrumentationConfigMap } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Instrumentation } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';

const start: (serviceName: string) => void = (serviceName: string): void => {
    const inputConfigs: InstrumentationConfigMap = {};
    const autoInstrumentations: Instrumentation[] = getNodeAutoInstrumentations(inputConfigs);
    const instrumentations: Instrumentation[][] = [autoInstrumentations];
    const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({ url: 'http://jaeger:4318/v1/traces' });
    const autoDetectResources: boolean = true;
    const CODE_VERSION: string = process.env.CODE_VERSION;
    const resource: Resource = new Resource({
        'code.owner': 'core-team',
        'code.deployment': '7',
        'code.version': CODE_VERSION
    });
    const configuration: Partial<NodeSDKConfiguration> = {
        traceExporter,
        serviceName,
        instrumentations,
        autoDetectResources,
        resource
    };

    const sdk: NodeSDK = new NodeSDK(configuration);

    sdk.start();
}

export default start;
