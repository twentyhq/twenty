// PROTOTYPE the chart's top: the smallest 1, 2 or 5 × 10^n at or above the
// value, so the bars always fill half the chart or more and the scale reads
// as a round figure.
export const creatorNiceCeiling = (value: number): number => {
  if (value <= 0) {
    return 1;
  }
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((factor) => factor * magnitude >= value);

  return (step ?? 10) * magnitude;
};
