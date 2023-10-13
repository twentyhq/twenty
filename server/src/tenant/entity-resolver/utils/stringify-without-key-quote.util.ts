export const stringifyWithoutKeyQuote = (obj: any) => {
  const jsonString = JSON.stringify(obj);
  const jsonWithoutQuotes = jsonString?.replace(/"(\w+)"\s*:/g, '$1:');

  return jsonWithoutQuotes;
};
