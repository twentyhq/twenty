import { singular } from 'pluralize';
import { type DataSource } from 'typeorm';

import {
  RemoteTableException,
  RemoteTableExceptionCode,
} from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.exception';
import { camelCase } from 'src/utils/camel-case';

const MAX_SUFFIX = 10;

type RemoteTableLocalName = {
  baseName: string;
  suffix?: number;
};

const isNameAvailable = async (
  tableName: string,
  workspaceSchemaName: string,
  coreDataSource: DataSource,
) => {
  const numberOfTablesWithSameName = +(
    await coreDataSource.query(
      `SELECT count(table_name) FROM information_schema.tables WHERE table_name LIKE $1 AND table_schema IN ('core', $2)`,
      [tableName, workspaceSchemaName],
    )
  )[0].count;

  return numberOfTablesWithSameName === 0;
};

export const getRemoteTableLocalName = async (
  distantTableName: string,
  workspaceSchemaName: string,
  coreDataSource: DataSource,
): Promise<RemoteTableLocalName> => {
  const baseName = singular(camelCase(distantTableName));
  const isBaseNameValid = await isNameAvailable(
    baseName,
    workspaceSchemaName,
    coreDataSource,
  );

  if (isBaseNameValid) {
    return { baseName };
  }

  for (let suffix = 2; suffix < MAX_SUFFIX; suffix++) {
    const name = `${baseName}${suffix}`;
    const isNameWithSuffixValid = await isNameAvailable(
      name,
      workspaceSchemaName,
      coreDataSource,
    );

    if (isNameWithSuffixValid) {
      return { baseName, suffix };
    }
  }

  throw new RemoteTableException(
    'Table name is already taken',
    RemoteTableExceptionCode.INVALID_REMOTE_TABLE_INPUT,
  );
};
