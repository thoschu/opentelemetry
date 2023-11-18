import {NodeSDK, NodeSDKConfiguration} from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations, InstrumentationConfigMap } from '@opentelemetry/auto-instrumentations-node';
import { ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Instrumentation } from '@opentelemetry/instrumentation';

import { CustomSampler } from './customSampler';

const start: (serviceName: string) => void = (serviceName: string): void => {
    const inputConfigs: InstrumentationConfigMap = {};
    const autoInstrumentations: Instrumentation[] = getNodeAutoInstrumentations(inputConfigs);
    const instrumentations: Instrumentation[][] = [autoInstrumentations];
    const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({ url: 'http://jaeger:4318/v1/traces' });
    const customSamplerRoot: CustomSampler = new CustomSampler();
    const traceIdRatioBasedSamplerRoot: TraceIdRatioBasedSampler = new TraceIdRatioBasedSampler(1);
    const sampler: ParentBasedSampler = new ParentBasedSampler({
        // root: customSamplerRoot
        root: traceIdRatioBasedSamplerRoot
    });
    const configuration: Partial<NodeSDKConfiguration> = {
        traceExporter,
        serviceName,
        instrumentations,
        sampler
    };

    const sdk: NodeSDK = new NodeSDK(configuration);

    sdk.start();
}

export default start;
