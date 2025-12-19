import { FieldMetadataType } from 'twenty-shared/types';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type FieldOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeRecordField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-record-field';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';

export const generateObjectRecordFields = ({
  objectMetadataInfo,
}: {
  objectMetadataInfo: ObjectMetadataInfo;
}): Record<string, FieldOutputSchema> => {
  const { flatObjectMetadata, flatFieldMetadataMaps } = objectMetadataInfo;

  const result: Record<string, FieldOutputSchema> = {};

  for (const fieldId of flatObjectMetadata.fieldMetadataIds) {
    const field = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: fieldId,
    });

    if (!shouldGenerateFieldFakeValue(field)) {
      continue;
    }

    if (isMorphOrRelationFlatFieldMetadata(field)) {
      const relationIdFieldName = `${field.name}Id`;
      const relationIdFieldLabel = camelToTitleCase(relationIdFieldName);

      result[relationIdFieldName] = generateFakeRecordField({
        type: FieldMetadataType.UUID,
        label: relationIdFieldLabel,
        icon: field.icon ?? undefined,
        fieldMetadataId: field.id,
      });
    } else {
      result[field.name] = generateFakeRecordField({
        type: field.type,
        label: field.label,
        icon: field.icon ?? undefined,
        fieldMetadataId: field.id,
      });
    }
  }

  return result;
};
