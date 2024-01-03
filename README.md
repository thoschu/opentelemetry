# Observability in Cloud Native and Frontend Apps using OpenTelemetry 💻

## 📊 Observability in Cloud Native and Frontend Apps using OpenTelemetry repository! This repository contains a demo application.

### https://opentelemetry.io/ecosystem/registry/
### https://opentelemetry.io/docs/specs/otel/overview/
### https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/opentelemetry-web/examples

---

1. **Clone the Repository: https://github.com/thoschu/opentelemetry** 

```bash
git clone https://github.com/thoschu/opentelemetry.git
```

2. **Checkout branch:** 

```bash
git checkout main
```

```bash
git checkout collector-browser-traceparent
```

3. **Running it with docker:** 

```bash
npm run build | docker compose up
```

or

```bash
npm start
```

3. **Services:**

> 📍 [Frontend](http://localhost:8080/)

> 📍 [Jaeger](http://localhost:16686/)
> > **https://www.jaegertracing.io/**

> 📍 [Zipkin](http://localhost:9411/)
> > **https://zipkin.io/**

> 📍 [Redis](http://localhost:8088/)
> > **https://redis.com/**
> >
> > **https://github.com/joeferner/redis-commander**

> 📍 [Prometheus](http://localhost:9090/)
> 
> > ``` histogram_quantile(0.95, sum(rate(http_calls_bucket[1m])) by (le, route)) ```
> >
> > ``` otel_http_calls_bucket ```
> >
> > ``` otel_http_calls_sum ```
>
> > **https://prometheus.io/**

> 📍 [Grafana](http://localhost:3000/)
> > **https://grafana.com/**
> >
> > **https://grafana.com/docs/loki/latest/**
> >
> > **https://grafana.com/docs/loki/latest/send-data/promtail/**

> 📍 [ToDo Service](http://localhost:8081/todos)

---

📬
*Tom S.*
*```thoschulte@gmail.com```*

Software made with ❤️ in Hamburg 🇩🇪

![qr-code](./assets/thomas-schulte.de.png)
