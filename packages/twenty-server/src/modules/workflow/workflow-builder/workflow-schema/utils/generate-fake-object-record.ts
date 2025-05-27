import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RecordOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';

export const generateFakeObjectRecord = (
  objectMetadataEntity: ObjectMetadataEntity,
): RecordOutputSchema => ({
  object: {
    isLeaf: true,
    icon: objectMetadataEntity.icon,
    label: objectMetadataEntity.labelSingular,
    value: objectMetadataEntity.description,
    nameSingular: objectMetadataEntity.nameSingular,
    fieldIdName: 'id',
  },
  fields: generateObjectRecordFields(objectMetadataEntity),
  _outputSchemaType: 'RECORD',
});
