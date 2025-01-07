export const customNamePrefix = '_';

export const computeTableName = (nameSingular: string, isCustom: boolean) => {
  return isCustom ? `${customNamePrefix}${nameSingular}` : nameSingular;
};
