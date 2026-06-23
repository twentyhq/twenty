import {
  type PipelineCardElements,
  type PipelineCardId,
  type PipelineLaneIndex,
  type PipelineLanes,
} from './pipeline-move-card';

export function getDropTarget(
  clientX: number,
  clientY: number,
  cardId: PipelineCardId,
  laneBodyElements: (HTMLDivElement | null)[],
  cardElements: PipelineCardElements,
  lanes: PipelineLanes,
): { cardIndex: number; laneIndex: PipelineLaneIndex } | null {
  const matchedLane = laneBodyElements.findIndex((element) => {
    const rect = element?.getBoundingClientRect();
    return (
      rect &&
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  });

  if (matchedLane < 0 || matchedLane > 2) {
    return null;
  }
  const laneIndex = matchedLane as PipelineLaneIndex;
  const laneCardIds = lanes[laneIndex].filter(
    (laneCardId) => laneCardId !== cardId,
  );
  let cardIndex = laneCardIds.length;

  for (const [index, laneCardId] of laneCardIds.entries()) {
    const rect = cardElements[laneCardId]?.getBoundingClientRect();

    if (rect && clientY < rect.top + rect.height / 2) {
      cardIndex = index;
      break;
    }
  }

  return { cardIndex, laneIndex };
}
