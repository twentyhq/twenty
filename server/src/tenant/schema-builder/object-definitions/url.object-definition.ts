import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

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
      objectId: FieldMetadataType.URL.toString(),
      name: 'text',
      label: 'Text',
      targetColumnMap: { value: 'text' },
    },
    {
      id: 'link',
      type: FieldMetadataType.TEXT,
      objectId: FieldMetadataType.URL.toString(),
      name: 'link',
      label: 'Link',
      targetColumnMap: { value: 'link' },
    },
  ],
  fromRelations: [],
  toRelations: [],
} as ObjectMetadataInterface;
