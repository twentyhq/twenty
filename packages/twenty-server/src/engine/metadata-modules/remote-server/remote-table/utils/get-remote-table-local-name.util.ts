import { singular } from 'pluralize';
import { DataSource } from 'typeorm';

import { camelCase } from 'src/utils/camel-case';
import {
  RemoteTableException,
  RemoteTableExceptionCode,
} from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.exception';

const MAX_SUFFIX = 10;

type RemoteTableLocalName = {
  baseName: string;
  suffix?: number;
};

const isNameAvailable = async (
  tableName: string,
  workspaceSchemaName: string,
  workspaceDataSource: DataSource,
) => {
  const numberOfTablesWithSameName = +(
    await workspaceDataSource.query(
      `SELECT count(table_name) FROM information_schema.tables WHERE table_name LIKE '${tableName}' AND table_schema IN ('core', 'metadata', '${workspaceSchemaName}')`,
    )
  )[0].count;

  return numberOfTablesWithSameName === 0;
};

export const getRemoteTableLocalName = async (
  distantTableName: string,
  workspaceSchemaName: string,
  workspaceDataSource: DataSource,
): Promise<RemoteTableLocalName> => {
  const baseName = singular(camelCase(distantTableName));
  const isBaseNameValid = await isNameAvailable(
    baseName,
    workspaceSchemaName,
    workspaceDataSource,
  );

  if (isBaseNameValid) {
    return { baseName };
  }

  for (let suffix = 2; suffix < MAX_SUFFIX; suffix++) {
    const name = `${baseName}${suffix}`;
    const isNameWithSuffixValid = await isNameAvailable(
      name,
      workspaceSchemaName,
      workspaceDataSource,
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
