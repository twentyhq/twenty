import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { IObjectMetadata } from 'src/tenant/schema-builder/metadata/object.metadata';

export const urlObjectDefinition = {
  id: FieldMetadataType.URL.toString(),
  nameSingular: 'Url',
  namePlural: 'Url',
  labelSingular: 'Url',
  labelPlural: 'Url',
  targetTableName: 'url',
  fields: [
    {
      id: 'text',
      type: FieldMetadataType.TEXT,
      name: 'text',
      label: 'Text',
      targetColumnMap: { value: 'text' },
    },
    {
      id: 'link',
      type: FieldMetadataType.TEXT,
      name: 'link',
      label: 'Link',
      targetColumnMap: { value: 'link' },
    },
  ],
} as IObjectMetadata;
