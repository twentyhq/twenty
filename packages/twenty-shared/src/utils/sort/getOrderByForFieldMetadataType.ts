import {
  type FieldMetadataSettingsMapping,
  FieldMetadataType,
  type OrderBy,
  type RecordGqlOperationOrderBy,
} from '@/types';
import { resolveAddressSortSubField } from '@/utils/sort/resolveAddressSortSubField';
import { resolvePrimaryFullNameSortSubField } from '@/utils/sort/resolvePrimaryFullNameSortSubField';

export type OrderByFieldMetadata = {
  name: string;
  type: `${FieldMetadataType}`;
  settings?: unknown;
};

export const getOrderByForFieldMetadataType = ({
  field,
  orderByDirection,
  primaryCompositeSubField,
}: {
  field: OrderByFieldMetadata;
  orderByDirection: OrderBy | null | undefined;
  primaryCompositeSubField?: string | null;
}): RecordGqlOperationOrderBy => {
  switch (field.type) {
    case FieldMetadataType.FULL_NAME: {
      const primarySubField = resolvePrimaryFullNameSortSubField({
        requestedPrimarySubField: primaryCompositeSubField,
      });
      const secondarySubField =
        primarySubField === 'firstName' ? 'lastName' : 'firstName';
      const direction = orderByDirection ?? 'AscNullsLast';
      return [
        { [field.name]: { [primarySubField]: direction } },
        { [field.name]: { [secondarySubField]: direction } },
      ];
    }
    case FieldMetadataType.ADDRESS: {
      const subField = resolveAddressSortSubField({
        settings: field.settings as
          | FieldMetadataSettingsMapping[FieldMetadataType.ADDRESS]
          | null
          | undefined,
        primaryCompositeSubField,
      });
      return [
        {
          [field.name]: {
            [subField]: orderByDirection ?? 'AscNullsLast',
          },
        },
      ];
    }
    case FieldMetadataType.CURRENCY:
      return [
        {
          [field.name]: {
            amountMicros: orderByDirection ?? 'AscNullsLast',
          },
        },
      ];
    case FieldMetadataType.ACTOR:
      return [
        {
          [field.name]: {
            name: orderByDirection ?? 'AscNullsLast',
          },
        },
      ];
    case FieldMetadataType.LINKS:
      return [
        {
          [field.name]: {
            primaryLinkUrl: orderByDirection ?? 'AscNullsLast',
          },
        },
      ];
    case FieldMetadataType.EMAILS:
      return [
        {
          [field.name]: {
            primaryEmail: orderByDirection ?? 'AscNullsLast',
          },
        },
      ];
    case FieldMetadataType.PHONES:
      return [
        {
          [field.name]: {
            primaryPhoneNumber: orderByDirection ?? 'AscNullsLast',
          },
        },
      ];
    default:
      return [
        {
          [field.name]: orderByDirection ?? 'AscNullsLast',
        },
      ];
  }
};
