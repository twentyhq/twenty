import { PositionDecimal } from '@/utils/position/internal/PositionDecimal';

export const computeEvenlySpacedPositions = ({
  startingPosition,
  endingPosition,
  numberOfPositions,
}: {
  startingPosition: number;
  endingPosition: number;
  numberOfPositions: number;
}): number[] => {
  const start = new PositionDecimal(startingPosition);
  const positionGapSize = new PositionDecimal(endingPosition).minus(start);

  if (positionGapSize.lt(0)) {
    throw new Error(
      `Cannot compute positions because starting position (${startingPosition}) is after ending position (${endingPosition})`,
    );
  }

  return Array.from({ length: numberOfPositions }, (_, index) =>
    start
      .plus(positionGapSize.times(index + 1).div(numberOfPositions + 1))
      .toNumber(),
  );
};
