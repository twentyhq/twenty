import { type RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

const serializeValue = (
  value: FlatRowLevelPermissionPredicate['value'],
): string => {
  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
};

export const fromFlatRowLevelPermissionPredicateToDto = (
  flatPredicate: FlatRowLevelPermissionPredicate,
): RowLevelPermissionPredicateDTO => {
  const { value, ...rest } = flatPredicate;

  return {
    ...rest,
    value: serializeValue(value),
  };
};
