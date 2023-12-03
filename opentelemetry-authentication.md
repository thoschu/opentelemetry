# Running and using the OpenTelemetry collector with authentication

https://github.com/open-telemetry/opentelemetry-collector-contrib

https://opentelemetry.io/docs/instrumentation/js/exporters/

---

## Receivers, Exporters and Extensions

**https://opentelemetry.io/docs/collector/configuration/#authentication**

### Configure the collector
Add the following content to `collector/config.yml`

```yml
extensions:
  health_check:
  oidc:
  basicauth/server:
    htpasswd:
      inline: |
        tom:password
  basicauth/client:
    client_auth:
      username: username
      password: password
  bearertokenauth:
    token: "randomtoken"
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318
      grpc:
        endpoint: 0.0.0.0:4317
  otlp/auth:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4316
        auth:
          authenticator: bearertokenauth
processors:
  batch:
exporters:
  logging:
    loglevel: debug
  debug: # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
  prometheus:
    endpoint: "0.0.0.0:8889"
    send_timestamps: true
    namespace: otel
    const_labels:
      via: collector
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true
  zipkin:
    endpoint: "http://zipkin:9411/api/v2/spans"
    format: proto
    tls:
      insecure: true
service:
  extensions: [bearertokenauth, health_check]
  telemetry:
    logs:
      level: "debug"
  pipelines:
    traces:
      receivers: [otlp/auth]
      processors: [batch]
      exporters: [debug, otlp/jaeger, zipkin]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug, prometheus]
```
