# Span processor performance tuning

https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-sdk-trace-base/src/export/BatchSpanProcessorBase.ts
### xxx file
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
