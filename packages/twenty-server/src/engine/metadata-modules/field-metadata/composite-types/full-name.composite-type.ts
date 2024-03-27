import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { generateTargetColumnMap } from 'src/engine/metadata-modules/field-metadata/utils/generate-target-column-map.util';

export const fullNameFields = (
  fieldMetadata?: FieldMetadataInterface,
): FieldMetadataInterface[] => {
  const inferredFieldMetadata = fieldMetadata as
    | FieldMetadataInterface<FieldMetadataType.FULL_NAME>
    | undefined;
  const targetColumnMap = inferredFieldMetadata
    ? generateTargetColumnMap(
        inferredFieldMetadata.type,
        inferredFieldMetadata.isCustom ?? false,
        inferredFieldMetadata.name,
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
      ...(inferredFieldMetadata
        ? {
            defaultValue: inferredFieldMetadata.defaultValue?.firstName ?? null,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.TEXT>,
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
      ...(inferredFieldMetadata
        ? {
            defaultValue: inferredFieldMetadata.defaultValue?.lastName ?? null,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.TEXT>,
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
  isActive: true,
  isSystem: true,
  isCustom: false,
  isRemote: false,
} satisfies ObjectMetadataInterface;

export type FullNameMetadata = {
  firstName: string;
  lastName: string;
};
