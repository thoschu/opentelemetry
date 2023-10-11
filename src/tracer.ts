import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import {MeterProvider, PeriodicExportingMetricReader} from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Meter } from '@opentelemetry/api';
import { ParentBasedSampler } from '@opentelemetry/sdk-trace-base';
import { W3CBaggagePropagator, W3CTraceContextPropagator, CompositePropagator } from '@opentelemetry/core';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';

import { XSampler } from "./sampler";
//import { dockerCGroupV1Detector } from '@opentelemetry/resource-detector-docker';

function start(serviceName: string): Meter {
    // ---------------------- Metrics -----------------------
    const { endpoint, port }: { endpoint: string, port: number }  = PrometheusExporter.DEFAULT_OPTIONS;

    // const exporter: PrometheusExporter = new PrometheusExporter({}, (): void => {
    //     console.log(`prometheus scrape endpoint: http://localhost:${port}${endpoint}`);
    // });
    const meterProvider: MeterProvider = new MeterProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName + '-xxx',
        })
    });

    // meterProvider.addMetricReader(exporter);

    const  metricReader: PeriodicExportingMetricReader = new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: 'http://collector:4318/v1/metrics',
        })
    });

    meterProvider.addMetricReader(metricReader);

    const meter: Meter = meterProvider.getMeter('default-service-meter');

    // ---------------------- Tracing ----------------------
    const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({
        //url: 'http://jaeger:4318/v1/traces',
        url: 'http://collector:4318/v1/traces',
    });

    const sdk: NodeSDK = new NodeSDK({
        traceExporter,
        serviceName: serviceName,
        instrumentations: [
            getNodeAutoInstrumentations({
                "@opentelemetry/instrumentation-fs": {
                    enabled: false
                },
                "@opentelemetry/instrumentation-http": {
                    headersToSpanAttributes: {
                        client: {
                            requestHeaders: ['tracestate', 'traceparent', 'baggage']
                        },
                        server: {
                            requestHeaders: ['tracestate', 'traceparent', 'baggage']
                        }
                    }
                }
            })
        ],
        autoDetectResources: true,
        //resourceDetectors: [dockerCGroupV1Detector],
        resource: new Resource({
            [ SemanticResourceAttributes.SERVICE_NAME ]: serviceName,
            [ SemanticResourceAttributes.SERVICE_NAMESPACE ]: "thoschu",
            [ SemanticResourceAttributes.SERVICE_VERSION ]: "1.0",
            [ SemanticResourceAttributes.SERVICE_INSTANCE_ID ]: "instance-id-1",
            'tea m.owner': 'core-team',
            'deployment': 77
        }),
        sampler: new ParentBasedSampler({
            root: new XSampler()
        }),
        textMapPropagator: new CompositePropagator({
            propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()]
        }),
        //spanProcessor: null
    });

    sdk.start();

    return meter;
}

export default start;
