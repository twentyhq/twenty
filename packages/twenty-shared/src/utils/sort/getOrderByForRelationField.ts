import { type OrderBy, type RecordGqlOperationOrderBy } from '@/types';
import {
  getOrderByForFieldMetadataType,
  type OrderByFieldMetadata,
} from '@/utils/sort/getOrderByForFieldMetadataType';
import { isDefined } from '@/utils/validation/isDefined';

export const getOrderByForRelationField = ({
  field,
  labelIdentifierField,
  orderByDirection,
}: {
  field: { name: string };
  labelIdentifierField: OrderByFieldMetadata | undefined;
  orderByDirection: OrderBy;
}): RecordGqlOperationOrderBy => {
  if (!isDefined(labelIdentifierField)) {
    return [{ [`${field.name}Id`]: orderByDirection }];
  }
  return getOrderByForFieldMetadataType({
    field: labelIdentifierField,
    orderByDirection,
  }).map((entry) => {
    return { [field.name]: entry };
  });
};
