# Configuration via environment variables

https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-sdk-node

### docker-compose.yml file
Add the following to `docker-compose.yml` file

```yml
# [...]
todo:
  # [...]
  environment:
    - OTEL_SDK_DISABLED=false # ❗❗❗
    - OTEL_LOG_LEVEL=ERROR
# [...]
  auth:
    # [...]
    environment:
      - OTEL_SDK_DISABLED=true # ❗❗❗
      - OTEL_LOG_LEVEL=ERROR
# [...]
```
