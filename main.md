# Information about the project and hints - Observability with OpenTelemetry

All of OpenTelemetry core concepts have been recorded in the attached feature branches.

## Backend

[README.md](README.md)

---

## Frontend/Browser 

[README.md](README.md)

### Logging

---

### Traces

- api: An API package used to add instrumentation for everything you care about in your application.
- sdk-trace-web: An SDK package, which creates traces that conform to the OpenTelemetry specification.
- exporter-trace-otlp-http: An exporter package, which is responsible for sending trace data out via HTTP requests.
- context-zone: A helper package that processes spans from across your application to ensure they have all the relevant context for rich telemetry.
- instrumentation: An instrumentation package that initializes automatic instrumentation.
- auto-instrumentations-web: A meta package that includes various web automatic instrumentation including request and document load instrumentation.

```typescript
import { BatchSpanProcessor, WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { LongTaskInstrumentation, ObserverCallbackInformation } from '@opentelemetry/instrumentation-long-task';
import { Span } from '@opentelemetry/api';

const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces'
});

const tracerProvider: WebTracerProvider = new WebTracerProvider({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'browser'
    })
});

tracerProvider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

tracerProvider.register({
    contextManager: new ZoneContextManager()
});

// Registering instrumentations
registerInstrumentations({
    instrumentations: [
        new DocumentLoadInstrumentation(),
        new FetchInstrumentation(),
        new UserInteractionInstrumentation(),
        new XMLHttpRequestInstrumentation()
    ],
    tracerProvider: provider
});
```

---

### Metrics

Unfortunately, there are no sufficiently good dependencies or libarays available for recording browser metrics (Web Vitals),
so you can alternatively record them yourself with corresponding browser API´s and then send them to an observability backend using the fecht api.

https://www.w3schools.com/js/js_api_intro.asp

https://web.dev/articles/vitals?hl=de

```typescript
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

const metricExporter: OTLPMetricExporter = new OTLPMetricExporter({
    url: 'http://localhost:4318/v1/metrics',
    headers: {},
    concurrencyLimit: 1,
});
const meterProvider: MeterProvider = new MeterProvider({
    resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: 'plain-browser' })
});

meterProvider.addMetricReader(new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 5000,
}));

const meter: Meter = meterProvider.getMeter('browser-meter');
const counter: Counter<Attributes> = meter.createCounter('test-counter');
const calls: Histogram<Attributes> = meter.createHistogram('http-calls-histogram');

counter.add(10, { 'key': 'value' });

calls.record(Date.now() - 2000,{
    route: '/test',
    status: '200',
    method: 'GET',
    language: navigator.language
});

registerInstrumentations({
    instrumentations: [
        new DocumentLoadInstrumentation(),
        // [...]
    ],
    tracerProvider,
    meterProvider: meterProvider
});

```

## JS Browser BOM and JS Web APIs

Various JavaScript APIs are available to read metrics in the browser.
These metrics can provide information about performance, usage, network communications,
and other aspects of the application. Here are some common APIs and methods with examples:

①. **Performance API**

```javascript
console.log(window.performance.timing);
console.log(performance.now());
console.log(performance.memory);
console.log(performance.getEntriesByType('navigation'));
```

②. **Navigator API**

```javascript
console.log(window.navigator.userAgent);
console.log(navigator.platform);
console.log(navigator.language);
```

③. **Screen API**

```javascript
console.log(window.screen.width);
console.log(screen.height);
```

④. **Network Information API**

```javascript
if (window.navigator.connection) {
  console.log(navigator.connection.effectiveType);
  console.log(navigator.connection.downlink);
}
```

⑤. **Geolocation API**

```javascript
if (window.navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);
  });
}
```

⑥. **Example with Fetch API**

```javascript
var userAgent = window.navigator.userAgent;
var navigation = performance.getEntriesByType('navigation');

fetch('http://collector:4318/v1/logs', {
    method: 'POST',
    body: JSON.stringify({
        title: 'metrics',
        body: {
            userAgent,
            navigation,
            // [...]
        }
    }),
    headers: {
        'Content-type': 'application/json; charset=UTF-8',
    }
}).then((response) => response.json())
  .then((data) => {
    console.log(data);
}).catch(console.error);
```

---

https://www.w3schools.com/js/js_window.asp

https://www.w3schools.com/js/js_window_screen.asp

https://www.w3schools.com/js/js_window_location.asp

https://www.w3schools.com/js/js_window_navigator.asp

https://www.w3schools.com/js/js_api_geolocation.asp
