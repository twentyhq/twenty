export const customNamePrefix = '_';

export const computeCustomName = (name: string, isCustom: boolean) => {
  return isCustom ? `${customNamePrefix}${name}` : name;
};
