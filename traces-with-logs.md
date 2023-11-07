# Correlate logs with traces

### Change logs to
```
try {
    throw new Error('Really bad error');
} catch (error: unknown) {
    const ctx: Context = api.context.active();
    const activeSpan: Span = api.trace.getSpan(ctx);
    const errorParams: { spanId: string; traceId: string; traceFlag: number; error: unknown; } = {
        spanId: activeSpan?.spanContext().spanId,
        traceId: activeSpan?.spanContext().traceId,
        traceFlag: activeSpan?.spanContext().traceFlags,
        error
    };

    activeSpan?.recordException(<Exception>error);

    console.error('Really bad error!', errorParams);

    res.status(500).send(errorParams);

    return;
}
```
