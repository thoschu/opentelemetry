# Adding custom attributes

### https://opentelemetry.io/docs/demo/manual-span-attributes/

❗ In Jaeger it´s the ``Tags`` ❗

### Add an import for OpenTelemetry API
```
import opentelemetry from '@opentelemetry/api';
```

### Get the active span and add custom attributes
```
const span = opentelemetry.trace.getActiveSpan();

span?.setAttribute('key','value');
```

---

![trace-spans.web](assets/trace-spans.webp)
