// Shifts through the decimal string so 2.55 rounds to 2.6, like SQL numeric round
export const roundExpressionNumber = ({
  value,
  decimals,
}: {
  value: number;
  decimals: number;
}): number => {
  const shiftedMagnitude = Number(`${Math.abs(value)}e${decimals}`);

  if (!Number.isFinite(shiftedMagnitude)) {
    return Number(value.toFixed(decimals));
  }

  return (
    Math.sign(value) * Number(`${Math.round(shiftedMagnitude)}e-${decimals}`)
  );
};
