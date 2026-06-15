export const formatToShortNumber = (amount: number) => {
  const sign = amount < 0 ? '-' : '';
  const absoluteAmount = Math.abs(amount);

  const suffixes = ['', 'k', 'm', 'b'];
  let scaledAmount = absoluteAmount;
  let suffixIndex = 0;

  // Promote to the next unit while the rounded display value reaches 1000, so
  // a value like 999_999 renders as "1m" instead of "1000k" (the rounding of
  // 999.999k up to 1000.0k pushed it past the suffix boundary).
  while (
    suffixIndex < suffixes.length - 1 &&
    Number(scaledAmount.toFixed(1)) >= 1000
  ) {
    scaledAmount /= 1000;
    suffixIndex += 1;
  }

  return (
    sign + scaledAmount.toFixed(1).replace(/\.?0+$/, '') + suffixes[suffixIndex]
  );
};
