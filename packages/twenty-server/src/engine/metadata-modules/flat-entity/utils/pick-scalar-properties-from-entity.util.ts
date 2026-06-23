import { type AllMetadataName } from 'twenty-shared/metadata';

import {
  ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME,
  type MetadataEntityPropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type EntityWithRegroupedOneToManyRelations } from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';

type AlwaysPresentScalarPropertyName =
  | 'id'
  | 'workspaceId'
  | 'applicationId'
  | 'universalIdentifier';

type ScalarPropertiesFromEntity<T extends AllMetadataName> = Pick<
  MetadataEntity<T>,
  | (MetadataEntityPropertyName<T> & keyof MetadataEntity<T>)
  | AlwaysPresentScalarPropertyName
>;

export const pickScalarPropertiesFromEntity = <T extends AllMetadataName>({
  metadataName,
  entity,
}: {
  metadataName: T;
  entity: EntityWithRegroupedOneToManyRelations<MetadataEntity<T>>;
}): ScalarPropertiesFromEntity<T> => {
  const propertiesConfiguration =
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName];
  const entityRecord = entity as Record<string, unknown>;

  const scalarProperties: Record<string, unknown> = {
    id: entityRecord.id,
    workspaceId: entityRecord.workspaceId,
    applicationId: entityRecord.applicationId,
    universalIdentifier: entityRecord.universalIdentifier,
  };

  for (const propertyName of Object.keys(propertiesConfiguration)) {
    scalarProperties[propertyName] = entityRecord[propertyName];
  }

  return scalarProperties as ScalarPropertiesFromEntity<T>;
};
