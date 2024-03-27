import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { generateTargetColumnMap } from 'src/engine/metadata-modules/field-metadata/utils/generate-target-column-map.util';

export const addressFields = (
  fieldMetadata?: FieldMetadataInterface,
): FieldMetadataInterface[] => {
  const inferredFieldMetadata = fieldMetadata as
    | FieldMetadataInterface<FieldMetadataType.ADDRESS>
    | undefined;
  const targetColumnMap = inferredFieldMetadata
    ? generateTargetColumnMap(
        inferredFieldMetadata.type,
        inferredFieldMetadata.isCustom ?? false,
        inferredFieldMetadata.name,
      )
    : {
        addressStreet1: 'addressStreet1',
        addressStreet2: 'addressStreet2',
        addressCity: 'addressCity',
        addressPostcode: 'addressPostcode',
        addressState: 'addressState',
        addressCountry: 'addressCountry',
        addressLat: 'addressLat',
        addressLng: 'addressLng',
      };

  return [
    {
      id: 'addressStreet1',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.ADDRESS.toString(),
      name: 'addressStreet1',
      label: 'Address',
      targetColumnMap: {
        value: targetColumnMap.addressStreet1,
      },
      isNullable: true,
      ...(inferredFieldMetadata
        ? {
            defaultValue:
              inferredFieldMetadata.defaultValue?.addressStreet1 ?? undefined,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.TEXT>,
    {
      id: 'addressStreet2',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.ADDRESS.toString(),
      name: 'addressStreet2',
      label: 'Address 2',
      targetColumnMap: {
        value: targetColumnMap.addressStreet2,
      },
      isNullable: true,
      ...(inferredFieldMetadata
        ? {
            defaultValue:
              inferredFieldMetadata.defaultValue?.addressStreet2 ?? null,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.TEXT>,
    {
      id: 'addressCity',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.ADDRESS.toString(),
      name: 'addressCity',
      label: 'City',
      targetColumnMap: {
        value: targetColumnMap.addressCity,
      },
      isNullable: true,
      ...(inferredFieldMetadata
        ? {
            defaultValue:
              inferredFieldMetadata.defaultValue?.addressCity ?? null,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.TEXT>,
    {
      id: 'addressPostcode',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.ADDRESS.toString(),
      name: 'addressPostcode',
      label: 'Postcode',
      targetColumnMap: {
        value: targetColumnMap.addressPostcode,
      },
      isNullable: true,
      ...(inferredFieldMetadata
        ? {
            defaultValue:
              inferredFieldMetadata.defaultValue?.addressPostcode ?? null,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.TEXT>,
    {
      id: 'addressState',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.ADDRESS.toString(),
      name: 'addressState',
      label: 'State',
      targetColumnMap: {
        value: targetColumnMap.addressState,
      },
      isNullable: true,
      ...(inferredFieldMetadata
        ? {
            defaultValue:
              inferredFieldMetadata.defaultValue?.addressState ?? null,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.TEXT>,
    {
      id: 'addressCountry',
      type: FieldMetadataType.TEXT,
      objectMetadataId: FieldMetadataType.ADDRESS.toString(),
      name: 'addressCountry',
      label: 'Country',
      targetColumnMap: {
        value: targetColumnMap.addressCountry,
      },
      isNullable: true,
      ...(inferredFieldMetadata
        ? {
            defaultValue:
              inferredFieldMetadata.defaultValue?.addressCountry ?? null,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.TEXT>,
    {
      id: 'addressLat',
      type: FieldMetadataType.NUMBER,
      objectMetadataId: FieldMetadataType.ADDRESS.toString(),
      name: 'addressLat',
      label: 'Latitude',
      targetColumnMap: {
        value: targetColumnMap.addressLat,
      },
      isNullable: true,
      ...(inferredFieldMetadata
        ? {
            defaultValue:
              inferredFieldMetadata.defaultValue?.addressLat ?? null,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.NUMBER>,
    {
      id: 'addressLng',
      type: FieldMetadataType.NUMBER,
      objectMetadataId: FieldMetadataType.ADDRESS.toString(),
      name: 'addressLng',
      label: 'Longitude',
      targetColumnMap: {
        value: targetColumnMap.addressLng,
      },
      isNullable: true,
      ...(inferredFieldMetadata
        ? {
            defaultValue:
              inferredFieldMetadata.defaultValue?.addressLng ?? null,
          }
        : {}),
    } satisfies FieldMetadataInterface<FieldMetadataType.NUMBER>,
  ];
};

export const addressObjectDefinition = {
  id: FieldMetadataType.ADDRESS.toString(),
  nameSingular: 'address',
  namePlural: 'address',
  labelSingular: 'Address',
  labelPlural: 'Addresses',
  targetTableName: '',
  fields: addressFields(),
  fromRelations: [],
  toRelations: [],
  isActive: true,
  isSystem: true,
  isCustom: false,
  isRemote: false,
} satisfies ObjectMetadataInterface;

export type AddressMetadata = {
  addressStreet1: string;
  addressStreet2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  addressCountry: string;
  addressLat: number;
  addressLng: number;
};
