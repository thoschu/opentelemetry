import { Attributes, Context, Link, SpanKind } from '@opentelemetry/api';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Sampler, SamplingResult, SamplingDecision } from '@opentelemetry/sdk-trace-base';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

export class CustomSampler implements Sampler {
    public shouldSample(context: Context, traceId: string, spanName: string, spanKind: SpanKind, attributes: Attributes, links: Link[]): SamplingResult {
        const { endpoint }: { endpoint: string } = PrometheusExporter.DEFAULT_OPTIONS;
        let decision: SamplingDecision;

        if (attributes[SemanticAttributes.HTTP_TARGET] === endpoint) {
            decision = SamplingDecision.NOT_RECORD;
        } else {
            decision = SamplingDecision.RECORD_AND_SAMPLED;
        }

        return {
            decision
        }
    }
}