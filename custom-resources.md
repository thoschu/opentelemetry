# Define custom resource

⭐ Resources are going to describe the environment of the application where all spans are running in.

#### https://opentelemetry.io/docs/instrumentation/js/resources/

In Jaeger it´s the ``Process`` ❗

Resources describe the metadata / environment like:
- Cloud region
- Pod IDs
- Deploment number
- Environmant
  - staging
  - development
  - production

### Add an import for OpenTelemetry resources
```typescript
import { Resource } from '@opentelemetry/resources';
```

### Add custom resource
Add the following code to the docker-compose.yml
```yml
environment:
  - NODE_ENV=staging
  - CODE_VERSION=77
```

Add the following code to the NodeSDK object

```typescript
autoDetectResources: false
```

and / or

```typescript
resource: new Resource({
  'code.owner': 'core-team',
  'deployment': '13',
  'code_version': process.env.CODE_VERSION,
  // [...]
})
```

like this

```typescript
const sdk: NodeSDK = new NodeSDK({
    traceExporter,
    serviceName,
    instrumentations,
    autoDetectResources: false,
    resource: new Resource({
        'code.owner': 'core-team',
        'deployment': '4',
    }),
});
```
