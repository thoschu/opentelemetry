# Observability in Cloud Native and Frontend Apps using OpenTelemetry 💻

## 📊 Observability in Cloud Native and Frontend Apps using OpenTelemetry repository! This repository contains a demo application.

### https://opentelemetry.io/ecosystem/registry/
### https://opentelemetry.io/docs/specs/otel/overview/

---

1. **Clone the Repository: https://github.com/thoschu/opentelemetry** 

```
git clone https://github.com/thoschu/opentelemetry.git
```

2. **Checkout branch:** 

```
git checkout main
```

```
git checkout metrics
```

3. **Running it with docker:** 

```
npm run build 

docker compose up
```

or

```
npm start
```

3. **Services:**

> [Frontend](http://localhost:8080/)

> [Jaeger](http://localhost:16686/)
> > https://www.jaegertracing.io/

> [Redis](http://localhost:8088/)
> > https://redis.com/
> 
> > https://github.com/joeferner/redis-commander

> [Prometheus](http://localhost:9090/)
> 
> > ```histogram_quantile(0.95, sum(rate(http_calls_bucket[1m])) by (le, route)) ```
>
> > https://prometheus.io/

> [ToDo Service](http://localhost:8081/todos)

---

📬
*Tom S.*
*```thoschulte@gmail.com```*

Software made with ❤️ in Hamburg 🇩🇪

![qr-code](./assets/thomas-schulte.de.png)
