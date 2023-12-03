import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Meter } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';

const start: (serviceName: string) => Meter = (serviceName: string): Meter => {
    // TRAICING
    const username: string = 'tom';
    const password: string = 'password';
    const token: string = 'randomtoken';
    const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({
        url: 'http://collector:4318/v1/traces',
        // headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Basic ${btoa(username + ':' + password)}`
        // },
    });

    const meterProvider: MeterProvider = new MeterProvider({
        resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName })
    });
    const metricReader: PeriodicExportingMetricReader = new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: 'http://collector:4318/v1/metrics'
        }),
        exportIntervalMillis: 1000
    });

    meterProvider.addMetricReader(metricReader);

    const meter: Meter = meterProvider.getMeter(`${serviceName}-service-meter`);

    const sdk: NodeSDK = new NodeSDK({
        traceExporter,
        serviceName: serviceName,
        instrumentations: [
            getNodeAutoInstrumentations()
        ]
    });

    sdk.start();

    return meter;
}

export default start;
