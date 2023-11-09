# Define custom resource

#### https://opentelemetry.io/docs/instrumentation/js/resources/

Resources describe the metadata / environment like:
- Cloud region
- Pod ID
- Deploment number
- Environmant

### Add an import for OpenTelemetry resources
```
import { Resource } from '@opentelemetry/resources';
```

### Add custom resource
Add the following code to the NodeSDK object
```
resource: new Resource({
    'team.owner':'core-team',
    'deployment':'4'
})
```
