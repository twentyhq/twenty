import { singular } from 'pluralize';

import { camelCase } from 'src/utils/camel-case';

export const getRemoteTableLocalName = (distantTableName: string) =>
  `${singular(camelCase(distantTableName))}Remote`;
