export const convertCurrencyAmountToCurrencyMicros = (
  currencyAmount: number,
) => {
  return Math.round(currencyAmount * 1000000);
};
