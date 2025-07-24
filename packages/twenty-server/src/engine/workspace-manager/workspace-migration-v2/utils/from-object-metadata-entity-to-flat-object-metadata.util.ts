import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  FlatObjectMetadata,
  objectMetadataEntityRelationProperties,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { fromFieldMetadataEntityToFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/utils/from-field-metadata-entity-to-flat-field-metadata.util';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

export const fromObjectMetadataEntityToFlatObjectMetadata = (
  objectMetadataEntity: ObjectMetadataEntity,
): FlatObjectMetadata => {
  const objectMetadataEntityWithoutRelations = removePropertiesFromRecord(
    objectMetadataEntity,
    objectMetadataEntityRelationProperties,
  );
  return {
    ...objectMetadataEntityWithoutRelations,
    flatIndexMetadatas: [], // TODO prastoin handle indexes
    uniqueIdentifier:
      objectMetadataEntityWithoutRelations.standardId ??
      objectMetadataEntityWithoutRelations.id,
    flatFieldMetadatas: objectMetadataEntity.fields.map(
      fromFieldMetadataEntityToFlatFieldMetadata,
    ),
  };
};
