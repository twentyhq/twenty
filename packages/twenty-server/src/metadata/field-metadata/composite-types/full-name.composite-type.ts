import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';
import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { generateTargetColumnMap } from 'src/metadata/field-metadata/utils/generate-target-column-map.util';

export const fullNameFields = (
  fieldMetadata?: FieldMetadataInterface,
): FieldMetadataInterface[] => {
  const targetColumnMap = fieldMetadata
    ? generateTargetColumnMap(
        fieldMetadata.type,
        fieldMetadata.isCustom ?? false,
        fieldMetadata.name,
      )
    : {
        firstName: 'firstName',
        lastName: 'lastName',
      };

  return [
    {
      id: 'firstName',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.FULL_NAME.toString(),
      name: 'firstName',
      label: 'First Name',
      targetColumnMap: {
        value: targetColumnMap.firstName,
      },
      isNullable: true,
    } satisfies FieldMetadataInterface,
    {
      id: 'lastName',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.FULL_NAME.toString(),
      name: 'lastName',
      label: 'Last Name',
      targetColumnMap: {
        value: targetColumnMap.lastName,
      },
      isNullable: true,
    } satisfies FieldMetadataInterface,
  ];
};

export const fullNameObjectDefinition = {
  id: FieldMetadataType.FULL_NAME.toString(),
  nameSingular: 'fullName',
  namePlural: 'fullName',
  labelSingular: 'FullName',
  labelPlural: 'FullName',
  targetTableName: '',
  fields: fullNameFields(),
  fromRelations: [],
  toRelations: [],
} satisfies ObjectMetadataInterface;

export type FullNameMetadata = {
  firstName: string;
  lastName: string;
};
