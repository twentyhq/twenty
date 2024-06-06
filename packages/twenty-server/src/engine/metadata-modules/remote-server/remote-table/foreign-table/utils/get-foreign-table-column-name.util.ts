import camelCase from 'lodash.camelcase';

export const getForeignTableColumnName = (distantTableColumnName: string) => {
  return camelCase(distantTableColumnName);
};
