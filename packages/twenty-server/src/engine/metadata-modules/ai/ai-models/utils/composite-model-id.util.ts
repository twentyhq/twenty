const COMPOSITE_SEPARATOR = '/';

export const buildCompositeModelId = (
  providerName: string,
  modelName: string,
): string => {
  if (providerName === modelName.split(COMPOSITE_SEPARATOR)[0]) {
    return modelName;
  }

  return `${providerName}${COMPOSITE_SEPARATOR}${modelName}`;
};
