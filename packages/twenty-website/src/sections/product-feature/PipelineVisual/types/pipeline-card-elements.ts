import { type PipelineCardId } from './pipeline-card-id';

export type PipelineCardElements = Partial<
  Record<PipelineCardId, HTMLDivElement | null>
>;
