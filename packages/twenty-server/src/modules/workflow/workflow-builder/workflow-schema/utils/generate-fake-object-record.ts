import { RecordOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';
import { ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

export const generateFakeObjectRecord = (
  objectMetadataInfo: ObjectMetadataInfo,
): RecordOutputSchema => {
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
    fields: generateObjectRecordFields({ objectMetadataInfo }),
    _outputSchemaType: 'RECORD',
  };
};
