export const formatToShortNumber = (amount: number) => {
  const sign = amount < 0 ? '-' : '';
  const absoluteAmount = Math.abs(amount);

  const format = (scaled: number, suffix: string) =>
    sign + scaled.toFixed(1).replace(/\.?0+$/, '') + suffix;

  if (Number(absoluteAmount.toFixed(1)) < 1000) {
    return format(absoluteAmount, '');
  }
  if (Number((absoluteAmount / 1_000).toFixed(1)) < 1000) {
    return format(absoluteAmount / 1_000, 'k');
  }
  if (Number((absoluteAmount / 1_000_000).toFixed(1)) < 1000) {
    return format(absoluteAmount / 1_000_000, 'm');
  }
  return format(absoluteAmount / 1_000_000_000, 'b');
};
