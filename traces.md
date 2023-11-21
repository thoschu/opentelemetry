# Traces

### Install OpenTelemetry libraries
```bash
yarn add @opentelemetry/api @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-proto @opentelemetry/sdk-node
```

### Create tracer.ts file
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

const start: (serviceName: string) => void = (serviceName: string): void => {
    const traceExporter: OTLPTraceExporter = new OTLPTraceExporter({
        url: 'http://jaeger:4318/v1/traces',
    });

    const sdk: NodeSDK = new NodeSDK({
        traceExporter,
        serviceName: serviceName,
        instrumentations: [getNodeAutoInstrumentations()]
    });

    sdk.start();
}

export default start;
```

### Run Jaeger
Add the following service to `docker-compose.yml` file

```yml
jaeger:
    networks:
        - backend
    image: jaegertracing/all-in-one
    ports:
        - "4318"
        - "16686:16686"
    environment:
        COLLECTOR_OTLP_ENABLED: true
```

### Add the trace.ts file to both services
The following code must be at the top of the file.
```typescript
import start from './tracer';

start('auth-service'); // change to 'todo-service' or 'ui-service' according to the file.

// [...]
```

> this should be added in `ui-service.ts`, `auth-service.ts` and `todo-service.ts`
