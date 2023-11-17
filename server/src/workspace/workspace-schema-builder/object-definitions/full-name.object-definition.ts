import { ObjectMetadataInterface } from 'src/workspace/workspace-schema-builder/interfaces/object-metadata.interface';
import { FieldMetadataInterface } from 'src/workspace/workspace-schema-builder/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export const fullNameObjectDefinition = {
  id: FieldMetadataType.FULL_NAME.toString(),
  nameSingular: 'fullName',
  namePlural: 'fullName',
  labelSingular: 'FullName',
  labelPlural: 'FullName',
  targetTableName: '',
  fields: [
    {
      id: 'firstName',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.FULL_NAME.toString(),
      name: 'firstName',
      label: 'First Name',
      targetColumnMap: { value: 'firstName' },
      isNullable: true,
    } satisfies FieldMetadataInterface,
    {
      id: 'lastName',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.FULL_NAME.toString(),
      name: 'lastName',
      label: 'Last Name',
      targetColumnMap: { value: 'lastName' },
      isNullable: true,
    } satisfies FieldMetadataInterface,
  ],
  fromRelations: [],
  toRelations: [],
} satisfies ObjectMetadataInterface;
