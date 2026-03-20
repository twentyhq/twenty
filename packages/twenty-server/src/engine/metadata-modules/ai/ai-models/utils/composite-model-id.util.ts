const COMPOSITE_SEPARATOR = '/';

export const buildCompositeModelId = (
  providerName: string,
  rawModelId: string,
): string => {
  if (providerName === rawModelId.split(COMPOSITE_SEPARATOR)[0]) {
    return rawModelId;
  }

  return `${providerName}${COMPOSITE_SEPARATOR}${rawModelId}`;
};
