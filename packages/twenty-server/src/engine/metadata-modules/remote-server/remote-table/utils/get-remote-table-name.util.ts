import { camelCase } from 'src/utils/camel-case';

export const getRemoteTableName = (distantTableName: string) =>
  `${camelCase(distantTableName)}Remote`;
