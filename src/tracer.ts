import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
// import { ExporterConfig, PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Meter } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import { BatchLogRecordProcessor, SimpleLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { Logger, logs } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { SeverityNumber } from '@opentelemetry/api-logs';

const start: (serviceName: string) => { meter: Meter; logger: Logger } = (serviceName: string): { meter: Meter; logger: Logger } => {
    // LOGS
    const loggerProvider: LoggerProvider = new LoggerProvider();
    const exporterConfig: OTLPExporterNodeConfigBase = {
        url: 'http://collector:4318/v1/logs', concurrencyLimit: 1
    };
    const logExporter: OTLPLogExporter = new OTLPLogExporter(exporterConfig);

    loggerProvider.addLogRecordProcessor(
        new SimpleLogRecordProcessor(logExporter)
    );

    logs.setGlobalLoggerProvider(loggerProvider);
    const logger: Logger = logs.getLogger(serviceName);

    // const collectorOptions: OTLPExporterNodeConfigBase = {
    //     url: 'http://collector:4318/v1/logs',
    //     concurrencyLimit: 1
    // };
    // const logExporter: OTLPLogExporter = new OTLPLogExporter(collectorOptions);
    // const loggerProvider: LoggerProvider = new LoggerProvider();
    // loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));
    //
    // const logger: Logger = loggerProvider.getLogger(serviceName, '1.0.0', { includeTraceContext: true });
    //
    // logger.emit({
    //     severityNumber: SeverityNumber.INFO,
    //     severityText: 'info',
    //     body: 'this is a log body',
    //     attributes: { 'log.type': 'custom' },
    // });

    // TRAICING
    const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({
        // url: 'http://jaeger:4318/v1/traces',
        url: 'http://collector:4318/v1/traces'
    });

    // METRICS
    const meterProvider: MeterProvider = new MeterProvider({
        resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName })
    });

    const metricExporter: OTLPMetricExporter = new OTLPMetricExporter({
        url: 'http://collector:4318/v1/metrics'
    });

    const metricReader: PeriodicExportingMetricReader = new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 1000
    });

    meterProvider.addMetricReader(metricReader);

    const meter: Meter = meterProvider.getMeter(`${serviceName}-service-meter`);

    const sdk: NodeSDK = new NodeSDK({
        traceExporter,
        serviceName: serviceName,
        instrumentations: [getNodeAutoInstrumentations()]
    });

    sdk.start();

    return { meter, logger };
}

export default start;
