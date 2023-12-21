import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';
import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { generateTargetColumnMap } from 'src/metadata/field-metadata/utils/generate-target-column-map.util';

export const linkFields = (
  fieldMetadata?: FieldMetadataInterface,
): FieldMetadataInterface[] => {
  const targetColumnMap = fieldMetadata
    ? generateTargetColumnMap(
        fieldMetadata.type,
        fieldMetadata.isCustom ?? false,
        fieldMetadata.name,
      )
    : {
        label: 'label',
        url: 'url',
      };

  return [
    {
      id: 'label',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.LINK.toString(),
      name: 'label',
      label: 'Label',
      targetColumnMap: {
        value: targetColumnMap.label,
      },
      isNullable: true,
    } satisfies FieldMetadataInterface,
    {
      id: 'url',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.LINK.toString(),
      name: 'url',
      label: 'Url',
      targetColumnMap: {
        value: targetColumnMap.url,
      },
      isNullable: true,
    } satisfies FieldMetadataInterface,
  ];
};

export const linkObjectDefinition = {
  id: FieldMetadataType.LINK.toString(),
  nameSingular: 'link',
  namePlural: 'link',
  labelSingular: 'Link',
  labelPlural: 'Link',
  targetTableName: '',
  fields: linkFields(),
  fromRelations: [],
  toRelations: [],
} satisfies ObjectMetadataInterface;

export type LinkMetadata = {
  label: string;
  url: string;
};
