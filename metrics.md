# Metrics

### Install OpenTelemetry libraries
```
yarn add @opentelemetry/sdk-metrics @opentelemetry/exporter-prometheus
```

### Creating Prometheus config file
Create `prometheus` folder

In it create a `prometheus.yml` file

Enter the following content to the newly created file

```
global:
  scrape_interval: 1s # Bad!! just for demo

scrape_configs:
  - job_name: 'opentelemetry'
    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'
    static_configs:
    - targets: ['todo:9464', 'auth:9464', 'ui:9464']
```


### Running Prometheus

```
  prometheus:
    networks:
      - backend
    image: prom/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    volumes:
      - ./prometheus/:/etc/prometheus/
    ports:
      - "9090:9090"
```


### Configure && expose OpenTelemetry meter
In the `tracer.ts` file add the following importers

```
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

```

Then add the following to the `start` function
```
    const { endpoint, port }: { endpoint: string, port: number } = PrometheusExporter.DEFAULT_OPTIONS;
    const options: ExporterConfig = { port, endpoint };
    const exporter: PrometheusExporter = new PrometheusExporter(options, (): void => {
        console.log(`Prometheus scrape endpoint: http://localhost:${port}${endpoint}`);
    });
    const meterProvider: MeterProvider = new MeterProvider({
        resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName })
    });

    meterProvider.addMetricReader(exporter);
    
    const meter: Meter = meterProvider.getMeter(`${serviceName}-service-meter`);
```

And return the meter `return meter;`

### Report metrics 
Get the meter from the tracer import `const meter: Meter = start('service');`

Then, and the following: 

```
const calls: Meter = meter.createHistogram('http-calls');

app.use((req: Request, res: Response, next: NextFunction): void => {
    const startTime: number = Date.now();

    req.on('end',(): void=> {
        const endTime: number = Date.now();

        calls.record(endTime-startTime,{
            route: req.route?.path,
            status: res.statusCode,
            method: req.method
        });
    });

    next();
});
```
