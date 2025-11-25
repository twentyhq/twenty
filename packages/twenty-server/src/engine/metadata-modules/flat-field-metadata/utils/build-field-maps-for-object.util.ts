import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export type FieldMapsForObject = {
  fieldIdByName: Record<string, string>;
  fieldIdByJoinColumnName: Record<string, string>;
};

export const buildFieldMapsForObject = (
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  objectMetadataId: string,
): FieldMapsForObject => {
  const fieldIdByName: Record<string, string> = {};
  const fieldIdByJoinColumnName: Record<string, string> = {};

  for (const [fieldId, field] of Object.entries(flatFieldMetadataMaps.byId)) {
    if (!isDefined(field)) {
      continue;
    }

    if (field.objectMetadataId !== objectMetadataId) {
      continue;
    }

    fieldIdByName[field.name] = fieldId;

    if (isMorphOrRelationFlatFieldMetadata(field)) {
      const joinColumnName = (
        field.settings as { joinColumnName?: string } | undefined
      )?.joinColumnName;

      if (joinColumnName) {
        fieldIdByJoinColumnName[joinColumnName] = fieldId;
      }
    }
  }

  return {
    fieldIdByName,
    fieldIdByJoinColumnName,
  };
};
