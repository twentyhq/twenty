import { type FromTo } from 'twenty-shared/types';

import { compareTwoFlatEntity } from 'src/engine/core-modules/common/utils/compare-two-flat-entity.util';
import { FLAT_VIEW_FIELD_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-view-field/constants/flat-view-field-properties-to-compare.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

type GetWorkspaceMigrationUpdateViewFieldActionArgs = FromTo<
  FlatViewField,
  'FlatViewField'
>;

export const compareTwoFlatViewField = ({
  fromFlatViewField,
  toFlatViewField,
}: GetWorkspaceMigrationUpdateViewFieldActionArgs) => {
  return compareTwoFlatEntity({
    fromFlatEntity: fromFlatViewField,
    toFlatEntity: toFlatViewField,
    jsonbProperties: [],
    propertiesToCompare: FLAT_VIEW_FIELD_PROPERTIES_TO_COMPARE,
  });
};
