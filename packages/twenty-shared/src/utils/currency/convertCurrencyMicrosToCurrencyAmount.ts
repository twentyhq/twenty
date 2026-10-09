export const convertCurrencyMicrosToCurrencyAmount = (
  currencyAmountMicros: number,
) => {
  return currencyAmountMicros / 1000000;
};
