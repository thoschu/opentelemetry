# Creating manual spans

### Add an import for OpenTelemetry API
```typescript
import { Span, trace } from '@opentelemetry/api';
```

### Start and end the span

```typescript
await trace.getTracer('init').startActiveSpan('Set default items', async (span: Span): Promise<void> => {
    // Application code goes here

    span.end();
});
```
