import { createCustomColumnName } from 'src/engine/utils/create-custom-column-name.util';
import { camelCase } from 'src/utils/camel-case';

export const createRelationForeignKeyColumnName = (
  name: string,
  isCustom: boolean,
) => {
  const baseColumnName = `${camelCase(name)}Id`;

  const foreignKeyColumnName = isCustom
    ? createCustomColumnName(baseColumnName)
    : baseColumnName;

  return foreignKeyColumnName;
};
