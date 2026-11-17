// Adding 0 turns -0 into 0
export const truncateTowardZero = (value: number): number =>
  Math.trunc(value) + 0;
