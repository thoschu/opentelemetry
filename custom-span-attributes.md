# Adding custom attributes

### Add an import for OpenTelemetry API
```
import opentelemetry from '@opentelemetry/api';
```

### Get the active span and add custom attributes

❗ In Jaeger it´s the ``Tags`` ❗

```
const span = opentelemetry.trace.getActiveSpan();

span?.setAttribute('key','value');
```
