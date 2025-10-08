import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type DestroyViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/destroy-view-field.input';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';

export const fromDestroyViewFieldInputToFlatViewFieldOrThrow = ({
  destroyViewFieldInput,
  flatViewFieldMaps,
}: {
  destroyViewFieldInput: DestroyViewFieldInput;
  flatViewFieldMaps: FlatViewFieldMaps;
}): FlatViewField => {
  const { id: viewFieldId } = extractAndSanitizeObjectStringFields(
    destroyViewFieldInput,
    ['id'],
  );

  const existingFlatViewFieldToDestroy = flatViewFieldMaps.byId[viewFieldId];

  if (!isDefined(existingFlatViewFieldToDestroy)) {
    throw new ViewFieldException(
      t`View field to destroy not found`,
      ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
    );
  }

  return existingFlatViewFieldToDestroy;
};
