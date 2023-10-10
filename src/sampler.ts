import { Attributes, Context, Link, SpanKind } from '@opentelemetry/api';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Sampler, SamplingResult, SamplingDecision } from '@opentelemetry/sdk-trace-base';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

export class XSampler implements Sampler {
    public shouldSample(context: Context, traceId: string, spanName: string, spanKind: SpanKind, attributes: Attributes, links: Link[]): SamplingResult {
        const { endpoint }: { endpoint: string } = PrometheusExporter.DEFAULT_OPTIONS;

        if(attributes[SemanticAttributes.HTTP_TARGET] === endpoint){
            console.log('No record', { attributes });

            return {
                decision:SamplingDecision.NOT_RECORD
            }
        }

        console.log({ context, traceId, spanName, spanKind, attributes, links });

        return {
            decision:SamplingDecision.RECORD_AND_SAMPLED
        }
    }
}
