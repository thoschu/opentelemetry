import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
// import { ExporterConfig, PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Meter } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';

const start: (serviceName: string) => Meter = (serviceName: string): Meter => {
    // TRAICING
    const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({
        // url: 'http://jaeger:4318/v1/traces',
        url: 'http://collector:4318/v1/traces'
    });

    // METRICS
    // const { endpoint, port }: { endpoint: string, port: number } = PrometheusExporter.DEFAULT_OPTIONS;
    // const options: ExporterConfig = { port, endpoint };
    // const exporter: PrometheusExporter = new PrometheusExporter(options, (): void => {
    //     console.log(`Prometheus scrape endpoint: http://localhost:${port}${endpoint}`);
    // });
    const metricReader: PeriodicExportingMetricReader = new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url:'http://collector:4318/v1/metrics'
        }),
        exportIntervalMillis: 10000
    })
    const meterProvider: MeterProvider = new MeterProvider({
        resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName })
    });

    meterProvider.addMetricReader(metricReader);

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
