# Turning on debug logs

### Option #1 - via env var
Add an environment variable like so
```yml
environment:
      - OTEL_LOG_LEVEL=DEBUG
```

### Option #2 - via code
Add the following imports

```typescript
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
```

Configure the logger
```typescript
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);
```
