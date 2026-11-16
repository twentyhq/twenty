import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-reader.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

// Several field maps: a field created in the same migration is not yet in the optimistic maps
export const buildUniversalComputedFieldSchemaReader = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMapsList,
}: {
  flatObjectMetadataMaps: UniversalFlatEntityMaps<UniversalFlatObjectMetadata>;
  flatFieldMetadataMapsList: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>[];
}): ComputedFieldSchemaReader<
  UniversalFlatObjectMetadata,
  UniversalFlatFieldMetadata
> => {
  const fieldsByObjectUniversalIdentifier = new Map<
    string,
    UniversalFlatFieldMetadata[]
  >();

  for (const flatFieldMetadataMaps of flatFieldMetadataMapsList) {
    for (const field of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(field)) {
        continue;
      }

      const objectFields =
        fieldsByObjectUniversalIdentifier.get(
          field.objectMetadataUniversalIdentifier,
        ) ?? [];

      fieldsByObjectUniversalIdentifier.set(
        field.objectMetadataUniversalIdentifier,
        [...objectFields, field],
      );
    }
  }

  const getRelationType = (field: UniversalFlatFieldMetadata) =>
    isMorphOrRelationUniversalFlatFieldMetadata(field)
      ? field.universalSettings?.relationType
      : undefined;

  const findObjectFields = (object: UniversalFlatObjectMetadata) =>
    fieldsByObjectUniversalIdentifier.get(object.universalIdentifier) ?? [];

  return {
    getObjectName: (object) => object.nameSingular,
    findFieldByName: (object, fieldName) =>
      findObjectFields(object).find((field) => field.name === fieldName),
    findToOneRelationFieldByJoinColumnName: (object, joinColumnName) =>
      findObjectFields(object).find(
        (field) =>
          getRelationType(field) === RelationType.MANY_TO_ONE &&
          computeMorphOrRelationFieldJoinColumnName({ name: field.name }) ===
            joinColumnName,
      ),
    getRelationType,
    findRelationTargetObject: (field) =>
      isDefined(field.relationTargetObjectMetadataUniversalIdentifier)
        ? findFlatEntityByUniversalIdentifier({
            universalIdentifier:
              field.relationTargetObjectMetadataUniversalIdentifier,
            flatEntityMaps: flatObjectMetadataMaps,
          })
        : undefined,
  };
};
