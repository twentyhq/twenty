import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type ScalarFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/scalar-flat-entity.type';

export const flatEntityToScalarFlatEntity = <T extends AllMetadataName>({
  metadataName,
  flatEntity,
}: {
  metadataName: T;
  flatEntity: MetadataFlatEntity<T>;
}): ScalarFlatEntity<MetadataEntity<T>> => {
  const config =
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName];
  const result: Record<string, unknown> = {};
  const flatEntityRecord = flatEntity as Record<string, unknown>;

  for (const key of Object.keys(config)) {
    result[key] = flatEntityRecord[key];
  }

  result.id = flatEntityRecord.id;
  result.workspaceId = flatEntityRecord.workspaceId;
  result.applicationId = flatEntityRecord.applicationId;
  result.universalIdentifier = flatEntityRecord.universalIdentifier;

  return result as ScalarFlatEntity<MetadataEntity<T>>;
};
