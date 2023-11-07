# Creating manual spans

### Add an import for OpenTelemetry API
```
import { Span, trace } from '@opentelemetry/api';
```

### Start and end the span

```
await trace.getTracer('init xxx').startActiveSpan('Set default items', async (span: Span): Promise<void> => {
    // Application code goes here

    span.end();
});
```
