import { PositionDecimal } from '@/utils/position/internal/PositionDecimal';

export const computeMidpointPosition = ({
  firstPosition,
  secondPosition,
}: {
  firstPosition: number;
  secondPosition: number;
}): number =>
  new PositionDecimal(firstPosition).plus(secondPosition).div(2).toNumber();
