import { type InputData } from '../utils/data.types';

const OBJECT_SUBFIELD_NAMES = ['secondaryLinks', 'additionalPhones'];

const formatArrayInputData = (
  key: string,
  arrayInputData: InputData,
): string => {
  if (OBJECT_SUBFIELD_NAMES.includes(key)) {
    return `${arrayInputData[key].join('","')}`;
  }
  return `"${arrayInputData[key].join('","')}"`;
};

const handleQueryParams = (inputData: InputData): string => {
  const formattedInputData: InputData = {};
  Object.keys(inputData).forEach((key) => {
    if (key.includes('__')) {
      const [objectKey, nestedObjectKey] = key.split('__');
      if (formattedInputData[objectKey]) {
        formattedInputData[objectKey][nestedObjectKey] = inputData[key];
      } else {
        formattedInputData[objectKey] = { [nestedObjectKey]: inputData[key] };
      }
    } else {
      formattedInputData[key] = inputData[key];
    }
  });
  let result = '';
  Object.keys(formattedInputData).forEach((key) => {
    let quote = '';
    if (Array.isArray(formattedInputData[key])) {
      result = result.concat(
        `${key}: [${formatArrayInputData(key, formattedInputData)}], `,
      );
    } else if (typeof formattedInputData[key] === 'object') {
      result = result.concat(
        `${key}: {${handleQueryParams(formattedInputData[key])}}, `,
      );
    } else {
      if (typeof formattedInputData[key] === 'string') quote = '"';
      result = result.concat(
        `${key}: ${quote}${formattedInputData[key]}${quote}, `,
      );
    }
  });
  if (result.length) result = result.slice(0, -2); // Remove the last ', '
  return result;
};
export default handleQueryParams;
