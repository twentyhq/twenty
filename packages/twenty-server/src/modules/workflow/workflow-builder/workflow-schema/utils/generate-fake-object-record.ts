import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type RecordOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';

export const generateFakeObjectRecord = ({
  objectMetadataInfo,
  depth = 0,
  maxDepth = 1,
}: {
  objectMetadataInfo: ObjectMetadataInfo;
  depth?: number;
  maxDepth?: number;
}): RecordOutputSchema => {
  return {
    object: {
      isLeaf: true,
      icon:
        objectMetadataInfo.objectMetadataItemWithFieldsMaps.icon ?? undefined,
      label: objectMetadataInfo.objectMetadataItemWithFieldsMaps.labelSingular,
      value: objectMetadataInfo.objectMetadataItemWithFieldsMaps.description,
      fieldIdName: 'id',
      objectMetadataId: objectMetadataInfo.objectMetadataItemWithFieldsMaps.id,
    },
    fields: generateObjectRecordFields({
      objectMetadataInfo,
      depth,
      maxDepth,
    }),
    _outputSchemaType: 'RECORD',
  };
};
