import { ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { RecordOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';

export const generateFakeObjectRecord = ({
  objectMetadataInfo,
  depth = 0,
}: {
  objectMetadataInfo: ObjectMetadataInfo;
  depth?: number;
}): RecordOutputSchema => {
  return {
    object: {
      isLeaf: true,
      icon: objectMetadataInfo.objectMetadataItemWithFieldsMaps.icon,
      label: objectMetadataInfo.objectMetadataItemWithFieldsMaps.labelSingular,
      value: objectMetadataInfo.objectMetadataItemWithFieldsMaps.description,
      nameSingular:
        objectMetadataInfo.objectMetadataItemWithFieldsMaps.nameSingular,
      fieldIdName: 'id',
    },
    fields: generateObjectRecordFields({
      objectMetadataInfo,
      depth,
    }),
    _outputSchemaType: 'RECORD',
  };
};
