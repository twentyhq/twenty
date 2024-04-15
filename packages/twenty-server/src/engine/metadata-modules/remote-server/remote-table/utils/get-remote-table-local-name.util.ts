import { camelCase } from 'src/utils/camel-case';

export const getRemoteTableLocalName = (distantTableName: string) =>
  `${camelCase(distantTableName)}Remote`;
