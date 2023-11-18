import {NodeSDK, NodeSDKConfiguration} from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations, InstrumentationConfigMap } from '@opentelemetry/auto-instrumentations-node';
import { ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Instrumentation } from '@opentelemetry/instrumentation';
import {ExporterConfig, PrometheusExporter} from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Meter } from '@opentelemetry/api';

import { CustomSampler } from './custom-sampler';

type UpperCappedRatioNumber = 0 | .1 | .2 | .3 | .4 | .5 | .6 | .7 | .8 | .9 | 1;

const start: (serviceName: string) => Meter = (serviceName: string): Meter => {
    const { endpoint, port }: { endpoint: string, port: number } = PrometheusExporter.DEFAULT_OPTIONS;
    const options: ExporterConfig = { port, endpoint };
    const exporter: PrometheusExporter = new PrometheusExporter(options, (): void => {
        console.log(`Prometheus scrape endpoint: http://localhost:${port}${endpoint}`);
    });
    const meterProvider: MeterProvider = new MeterProvider({
        resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName })
    });

    meterProvider.addMetricReader(exporter);
    const meter: Meter = meterProvider.getMeter(`${serviceName}-service-meter`);

    const inputConfigs: InstrumentationConfigMap = {};
    const autoInstrumentations: Instrumentation[] = getNodeAutoInstrumentations(inputConfigs);
    const instrumentations: Instrumentation[][] = [autoInstrumentations];
    const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({ url: 'http://jaeger:4318/v1/traces' });
    // ToDo:
    const customSamplerRoot: CustomSampler = new CustomSampler();
    const ratio: UpperCappedRatioNumber = 1; // 0 - 1 as float
    const traceIdRatioBasedSamplerRoot: TraceIdRatioBasedSampler = new TraceIdRatioBasedSampler(ratio);
    const sampler: ParentBasedSampler = new ParentBasedSampler({
        root: ratio === 1 ? customSamplerRoot : traceIdRatioBasedSamplerRoot,
    });
    const configuration: Partial<NodeSDKConfiguration> = {
        traceExporter,
        serviceName,
        instrumentations,
        // ToDo:
        sampler
    };

    const sdk: NodeSDK = new NodeSDK(configuration);

    sdk.start();

    return meter;
}

export default start;
