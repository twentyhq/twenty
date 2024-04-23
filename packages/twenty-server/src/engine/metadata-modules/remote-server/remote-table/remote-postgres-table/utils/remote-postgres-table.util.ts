import { Repository } from 'typeorm/repository/Repository';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { decryptText } from 'src/engine/core-modules/auth/auth.util';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
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

  const password = decryptText(userMappingOptions.password, secretKey);

  const url = `postgres://${userMappingOptions.username}:${password}@${foreignDataWrapperOptions.host}:${foreignDataWrapperOptions.port}/${foreignDataWrapperOptions.dbname}`;

  return url;
};

export const mapUdtNameToFieldType = (udtName: string): FieldMetadataType => {
  switch (udtName) {
    case 'uuid':
      return FieldMetadataType.UUID;
    case 'varchar':
      return FieldMetadataType.TEXT;
    case 'bool':
      return FieldMetadataType.BOOLEAN;
    case 'timestamp':
    case 'timestamptz':
      return FieldMetadataType.DATE_TIME;
    case 'integer':
    case 'int2':
    case 'int4':
    case 'int8':
      return FieldMetadataType.NUMBER;
    default:
      return FieldMetadataType.TEXT;
  }
};

export const mapUdtNameToSettings = (
  udtName: string,
): FieldMetadataSettings<FieldMetadataType> | undefined => {
  switch (udtName) {
    case 'integer':
    case 'int2':
    case 'int4':
    case 'int8':
      return {
        precision: 0,
      } satisfies FieldMetadataSettings<FieldMetadataType.NUMBER>;
    default:
      return undefined;
  }
};

export const isPostgreSQLIntegrationEnabled = async (
  featureFlagRepository: Repository<FeatureFlagEntity>,
  workspaceId: string,
) => {
  const featureFlag = await featureFlagRepository.findOneBy({
    workspaceId,
    key: FeatureFlagKeys.IsPostgreSQLIntegrationEnabled,
    value: true,
  });

  const featureFlagEnabled = featureFlag && featureFlag.value;

  if (!featureFlagEnabled) {
    throw new Error('PostgreSQL integration is not enabled');
  }
};
