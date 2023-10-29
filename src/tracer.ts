import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Meter } from '@opentelemetry/api';

const start: (serviceName: string) => Meter = (serviceName: string): Meter => {
    // TRAICING
    const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({
        url: 'http://jaeger:4318/v1/traces',
    });

    // METRICS
    const { endpoint, port }: { endpoint: string, port: number } = PrometheusExporter.DEFAULT_OPTIONS;
    const exporter: PrometheusExporter = new PrometheusExporter({}, (): void => {
        console.log(`Prometheus scrape endpoint: http://localhost:${port}${endpoint}`);
    });
    const meterProvider: MeterProvider = new MeterProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });

    // @ts-ignore
    meterProvider.addMetricReader(exporter);

    const meter: Meter = meterProvider.getMeter(`${serviceName}-service-meter`);

    const sdk: NodeSDK = new NodeSDK({
        traceExporter,
        serviceName: serviceName,
        instrumentations: [getNodeAutoInstrumentations()]
    });

    sdk.start();

    return meter;
}

export default start;
