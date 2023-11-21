# Context propagation and baggage

### import both W3C context propagation
Import in tracer.ts
```typescript
import { W3CBaggagePropagator, W3CTraceContextPropagator, CompositePropagator } from '@opentelemetry/core'
```

### Configure context propagators
In the `NodeSDK` object
```typescript
textMapPropagator: new CompositePropagator({
    propagators: [
        new W3CTraceContextPropagator(),
        new W3CBaggagePropagator()
    ]
})
```

like this

```typescript
const sdk: NodeSDK = new NodeSDK({
    // [...]
    textMapPropagator: new CompositePropagator({
        propagators: [
            new W3CTraceContextPropagator(),
            new W3CBaggagePropagator()
        ]
    })
});
```

### Set the baggage
Create the baggage before we call auth service
```typescript
import { Baggage, Context, context, propagation } from '@opentelemetry/api';

const baggage: Baggage = propagation.createBaggage({
    key1: {
        value: "value1"
    }
});
const contextWithBaggage: Context = propagation.setBaggage(context.active(), baggage);
```

### Use the context with baggage to call a service
```typescript
context.with(contextWithBaggage, async () => {
    /// Any new span in this context will have the baggage. 
})

```

### Extract the baggage in downstream service

```typescript
import { Baggage, BaggageEntry, propagation } from '@opentelemetry/api';

const baggage: Baggage = propagation.getActiveBaggage();
const baggageEntry: BaggageEntry = baggage?.getEntry('key1');

// [...]
```
