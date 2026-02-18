export const formatToShortNumber = (amount: number) => {
  const sign = amount < 0 ? '-' : '';
  const absoluteAmount = Math.abs(amount);

  if (absoluteAmount < 1000) {
    return sign + absoluteAmount.toFixed(1).replace(/\.?0+$/, '');
  }

  if (absoluteAmount < 1_000_000) {
    return (
      sign + (absoluteAmount / 1000).toFixed(1).replace(/\.?0+$/, '') + 'k'
    );
  }

  if (absoluteAmount < 1_000_000_000) {
    return (
      sign + (absoluteAmount / 1_000_000).toFixed(1).replace(/\.?0+$/, '') + 'm'
    );
  }

  return (
    sign +
    (absoluteAmount / 1_000_000_000).toFixed(1).replace(/\.?0+$/, '') +
    'b'
  );
};
