import { clampToRange } from '@/platform/motion';

import { type PipelineCardId } from '../types/pipeline-card-id';
import { type PipelineLaneIndex } from '../types/pipeline-lane-index';
import { type PipelineLanes } from '../types/pipeline-lanes';

export function movePipelineCard(
  lanes: PipelineLanes,
  cardId: PipelineCardId,
  targetLane: PipelineLaneIndex,
  targetIndex: number,
): PipelineLanes {
  const next = lanes.map((lane) =>
    lane.filter((laneCardId) => laneCardId !== cardId),
  ) as PipelineLanes;
  const bounded = clampToRange(targetIndex, 0, next[targetLane].length);
  next[targetLane] = [
    ...next[targetLane].slice(0, bounded),
    cardId,
    ...next[targetLane].slice(bounded),
  ];
  return next;
}
