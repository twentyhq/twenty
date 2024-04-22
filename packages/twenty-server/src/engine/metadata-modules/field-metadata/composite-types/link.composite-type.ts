import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { generateTargetColumnMap } from 'src/engine/metadata-modules/field-metadata/utils/generate-target-column-map.util';

export const linkFields = (
  fieldMetadata?: FieldMetadataInterface,
): FieldMetadataInterface[] => {
  const inferredFieldMetadata = fieldMetadata as
    | FieldMetadataInterface<FieldMetadataType.LINK>
    | undefined;
  const targetColumnMap = inferredFieldMetadata
    ? generateTargetColumnMap(
        inferredFieldMetadata.type,
        inferredFieldMetadata.isCustom ?? false,
        inferredFieldMetadata.name,
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
      ...(inferredFieldMetadata
        ? {
            defaultValue: inferredFieldMetadata.defaultValue?.label ?? null,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.TEXT>,
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
      ...(inferredFieldMetadata
        ? {
            defaultValue: inferredFieldMetadata.defaultValue?.url ?? null,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.TEXT>,
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
  isActive: true,
  isSystem: true,
  isCustom: false,
  isRemote: false,
} satisfies ObjectMetadataInterface;

export type LinkMetadata = {
  label: string;
  url: string;
};
