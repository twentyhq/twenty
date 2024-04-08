export const customNamePrefix = '_';

export const computeTableName = (name: string, isCustom: boolean) => {
  return isCustom ? `${customNamePrefix}${name}` : name;
};
