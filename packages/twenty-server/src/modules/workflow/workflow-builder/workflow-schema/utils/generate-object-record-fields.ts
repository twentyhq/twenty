import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type FieldOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { generateFakeRecordField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-record-field';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';

export const generateObjectRecordFields = ({
  objectMetadataInfo,
  depth = 0,
  maxDepth = 1,
}: {
  objectMetadataInfo: ObjectMetadataInfo;
  depth?: number;
  maxDepth?: number;
}): Record<string, FieldOutputSchema> => {
  const objectMetadata = objectMetadataInfo.objectMetadataItemWithFieldsMaps;

  return Object.values(objectMetadata.fieldsById).reduce(
    (acc: Record<string, FieldOutputSchema>, field) => {
      if (!shouldGenerateFieldFakeValue(field)) {
        return acc;
      }

      if (field.type !== FieldMetadataType.RELATION) {
        acc[field.name] = generateFakeRecordField({
          type: field.type,
          label: field.label,
          icon: field.icon ?? undefined,
          fieldMetadataId: field.id,
        });

        return acc;
      }

      if (!isDefined(field.relationTargetObjectMetadataId)) {
        return acc;
      }

      if (depth < maxDepth) {
        const relationTargetObjectMetadata =
          objectMetadataInfo.objectMetadataMaps.byId[
            field.relationTargetObjectMetadataId
          ];

        if (!isDefined(relationTargetObjectMetadata)) {
          return acc;
        }

        acc[field.name] = {
          isLeaf: false,
          icon: field.icon ?? undefined,
          label: field.label,
          type: field.type,
          fieldMetadataId: field.id,
          value: generateFakeObjectRecord({
            objectMetadataInfo: {
              objectMetadataItemWithFieldsMaps: relationTargetObjectMetadata,
              objectMetadataMaps: objectMetadataInfo.objectMetadataMaps,
            },
            depth: depth + 1,
          }),
        };
      } else if (depth === maxDepth) {
        const relationIdFieldName = `${field.name}Id`;
        const relationIdFieldLabel = camelToTitleCase(relationIdFieldName);

        acc[relationIdFieldName] = generateFakeRecordField({
          type: FieldMetadataType.UUID,
          label: relationIdFieldLabel,
          icon: field.icon ?? undefined,
          fieldMetadataId: field.id,
        });
      }

      return acc;
    },
    {} as Record<string, FieldOutputSchema>,
  );
};
