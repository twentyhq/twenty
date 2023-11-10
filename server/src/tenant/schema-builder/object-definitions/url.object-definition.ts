import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';
import { FieldMetadataInterface } from 'src/tenant/schema-builder/interfaces/field-metadata.interface';

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
      objectMetadataId: FieldMetadataType.URL.toString(),
      name: 'text',
      label: 'Text',
      targetColumnMap: { value: 'text' },
    } satisfies FieldMetadataInterface,
    {
      id: 'link',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.URL.toString(),
      name: 'link',
      label: 'Link',
      targetColumnMap: { value: 'link' },
    } satisfies FieldMetadataInterface,
  ],
  fromRelations: [],
  toRelations: [],
} satisfies ObjectMetadataInterface;
