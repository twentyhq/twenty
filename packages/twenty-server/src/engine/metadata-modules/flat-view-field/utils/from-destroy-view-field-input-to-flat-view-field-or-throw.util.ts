import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type DestroyViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/destroy-view-field.input';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const fromDestroyViewFieldInputToFlatViewFieldOrThrow = ({
  destroyViewFieldInput,
  flatViewFieldMaps,
}: {
  destroyViewFieldInput: DestroyViewFieldInput;
  flatViewFieldMaps: FlatViewFieldMaps;
}): UniversalFlatViewField => {
  const { id: viewFieldId } = extractAndSanitizeObjectStringFields(
    destroyViewFieldInput,
    ['id'],
  );

  const existingFlatViewFieldToDestroy = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewFieldId,
    flatEntityMaps: flatViewFieldMaps,
  });

  if (!isDefined(existingFlatViewFieldToDestroy)) {
    throw new ViewFieldException(
      t`View field to destroy not found`,
      ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
    );
  }

  return existingFlatViewFieldToDestroy;
};
