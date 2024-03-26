import { decryptText } from 'src/engine/core-modules/auth/auth.util';
import {
  RemoteServerEntity,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';

export const EXCLUDED_POSTGRES_SCHEMAS = [
  'information_schema',
  'pg_catalog',
  'pg_toast',
];

export const buildPostgresUrl = (
  secretKey: string,
  remoteServer: RemoteServerEntity<RemoteServerType>,
): string => {
  const foreignDataWrapperOptions = remoteServer.foreignDataWrapperOptions;
  const userMappingOptions = remoteServer.userMappingOptions;

  const password = decryptText(
    userMappingOptions.password,
    secretKey,
    secretKey,
  );

  const url = `postgres://${userMappingOptions.username}:${password}@${foreignDataWrapperOptions.host}:${foreignDataWrapperOptions.port}/${foreignDataWrapperOptions.dbname}`;

  return url;
};
