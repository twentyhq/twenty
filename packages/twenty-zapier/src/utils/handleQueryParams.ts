const handleQueryParams = (inputData: { [x: string]: any }): string => {
  let result = '';
  Object.keys(inputData).forEach((key) => {
    let quote = '';
    if (typeof inputData[key] === 'string') quote = '"';
    result = result.concat(`${key}: ${quote}${inputData[key]}${quote}, `);
  });
  if (result.length) result = result.slice(0, -2); // Remove the last ', '
  return result;
};
export default handleQueryParams;
