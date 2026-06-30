import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type RecordOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';

export const generateFakeObjectRecord = ({
  objectMetadataInfo,
}: {
  objectMetadataInfo: ObjectMetadataInfo;
}): RecordOutputSchema => {
  const { flatObjectMetadata } = objectMetadataInfo;

  return {
    object: {
      isLeaf: true,
      icon: flatObjectMetadata.icon ?? undefined,
      label: flatObjectMetadata.labelSingular,
      value: flatObjectMetadata.description,
      fieldIdName: 'id',
      objectMetadataId: flatObjectMetadata.id,
    },
    fields: generateObjectRecordFields({
      objectMetadataInfo,
    }),
    _outputSchemaType: 'RECORD',
  };
};
