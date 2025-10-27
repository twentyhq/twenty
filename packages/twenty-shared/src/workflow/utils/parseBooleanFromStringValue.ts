export const parseBooleanFromStringValue = (value: unknown) => {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
};
