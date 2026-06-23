import { clampToRange } from '@/platform/motion';

export type PipelineCardId =
  | 'airbnb'
  | 'figma'
  | 'github'
  | 'notion'
  | 'stripe';
export type PipelineLaneIndex = 0 | 1 | 2;
export type PipelineLanes = [
  PipelineCardId[],
  PipelineCardId[],
  PipelineCardId[],
];

// Pulls a card out of whichever lane holds it and splices it into the
// target lane at a bounded index.
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
