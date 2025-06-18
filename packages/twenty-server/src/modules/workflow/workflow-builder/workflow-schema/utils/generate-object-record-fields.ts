import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { BaseOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-field';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value';

const MAXIMUM_DEPTH = 1;

export const generateObjectRecordFields = ({
  objectMetadataInfo,
  depth = 0,
}: {
  objectMetadataInfo: ObjectMetadataInfo;
  depth?: number;
}): BaseOutputSchema => {
  const objectMetadata = objectMetadataInfo.objectMetadataItemWithFieldsMaps;

  return objectMetadata.fields.reduce((acc: BaseOutputSchema, field) => {
    if (!shouldGenerateFieldFakeValue(field)) {
      return acc;
    }

    if (field.type !== FieldMetadataType.RELATION) {
      acc[field.name] = generateFakeField({
        type: field.type,
        label: field.label,
        icon: field.icon,
      });

      return acc;
    }

    if (
      depth < MAXIMUM_DEPTH &&
      isDefined(field.relationTargetObjectMetadataId)
    ) {
      const relationTargetObjectMetadata =
        objectMetadataInfo.objectMetadataMaps.byId[
          field.relationTargetObjectMetadataId
        ];

      acc[field.name] = {
        isLeaf: false,
        icon: field.icon,
        label: field.label,
        value: generateFakeObjectRecord({
          objectMetadataInfo: {
            objectMetadataItemWithFieldsMaps: relationTargetObjectMetadata,
            objectMetadataMaps: objectMetadataInfo.objectMetadataMaps,
          },
          depth: depth + 1,
        }),
      };
    }

    return acc;
  }, {} as BaseOutputSchema);
};
