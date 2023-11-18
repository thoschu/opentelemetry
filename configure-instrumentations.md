# Configure instrumentations

### Get the active span and add custom attributes
```typescript
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
```
