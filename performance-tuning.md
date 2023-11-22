# Span processor performance tuning

A span processor sends to data to the exporter.
The processor in OpenTelemetry is responsible for transforming and processing this data. This can include filtering data, adding tags, or enriching data with additional information. By using processors, developers can customize and format the telemetry data to better suit their specific needs.

https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-sdk-trace-base/src/export/BatchSpanProcessorBase.ts

### Option #1 - via env code
Add the following partially to `tracer.ts` file

```typescript
spanProcessor: null
```

like this

```typescript
// [...]
const sdk: NodeSDK = new NodeSDK({
    traceExporter,
    serviceName: serviceName,
    instrumentations: [getNodeAutoInstrumentations()],
    spanProcessor: null
});
```

### Option #1 - via env var

---

![qr-code](./assets/processor.png)
