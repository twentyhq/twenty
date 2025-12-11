import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type DeleteViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/delete-view-field.input';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';

export const fromDeleteViewFieldInputToFlatViewFieldOrThrow = ({
  deleteViewFieldInput: rawDeleteViewFieldInput,
  flatViewFieldMaps,
}: {
  deleteViewFieldInput: DeleteViewFieldInput;
  flatViewFieldMaps: FlatViewFieldMaps;
}): FlatViewField => {
  const { id: viewFieldId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewFieldInput,
    ['id'],
  );

  const existingFlatViewFieldToDelete = flatViewFieldMaps.byId[viewFieldId];

  if (!isDefined(existingFlatViewFieldToDelete)) {
    throw new ViewFieldException(
      t`View field to delete not found`,
      ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
    );
  }

  return {
    ...existingFlatViewFieldToDelete,
    deletedAt: new Date().toISOString(),
  };
};
