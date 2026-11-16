import { type ComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-reader.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildOrmComputedFieldSchemaReader = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): ComputedFieldSchemaReader<FlatObjectMetadata, OrmFlatFieldMetadata> => {
  const findFieldById = (fieldMetadataId: string | undefined) =>
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

  return {
    getObjectName: (flatObjectMetadata) => flatObjectMetadata.nameSingular,
    findFieldByName: (flatObjectMetadata, fieldName) =>
      findFieldById(
        buildFieldMapsFromFlatObjectMetadata(
          flatFieldMetadataMaps,
          flatObjectMetadata,
        ).fieldIdByName[fieldName],
      ),
    findToOneRelationFieldByJoinColumnName: (
      flatObjectMetadata,
      joinColumnName,
    ) =>
      findFieldById(
        buildFieldMapsFromFlatObjectMetadata(
          flatFieldMetadataMaps,
          flatObjectMetadata,
        ).fieldIdByJoinColumnName[joinColumnName],
      ),
    getRelationType: (flatFieldMetadata) =>
      isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)
        ? flatFieldMetadata.settings?.relationType
        : undefined,
    findRelationTargetObject: (flatFieldMetadata) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      }),
  };
};
