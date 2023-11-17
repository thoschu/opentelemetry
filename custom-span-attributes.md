# Adding custom attributes

⭐ An span attribute is going to describe a particular span.

### https://opentelemetry.io/docs/demo/manual-span-attributes/

In Jaeger it´s the ``Tags`` ❗

### Add an import for OpenTelemetry API
```
import { trace, Span } from '@opentelemetry/api';
```

### Get the active span and add custom attributes
```
const span: Span = trace.getActiveSpan();

// span?.setAttribute('key','value');

span?.setAttributes({ id: 1, nonce: index });
```

---

![trace-spans.web](assets/trace-spans.webp)
