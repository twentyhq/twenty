import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type DeleteViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/delete-view-field.input';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const fromDeleteViewFieldInputToFlatViewFieldOrThrow = ({
  deleteViewFieldInput: rawDeleteViewFieldInput,
  flatViewFieldMaps,
}: {
  deleteViewFieldInput: DeleteViewFieldInput;
  flatViewFieldMaps: FlatViewFieldMaps;
}): UniversalFlatViewField => {
  const { id: viewFieldId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewFieldInput,
    ['id'],
  );

  const existingFlatViewFieldToDelete = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewFieldId,
    flatEntityMaps: flatViewFieldMaps,
  });

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
