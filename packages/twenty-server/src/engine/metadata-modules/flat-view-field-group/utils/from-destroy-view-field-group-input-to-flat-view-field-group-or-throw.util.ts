import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type DestroyViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/destroy-view-field-group.input';
import {
  ViewFieldGroupException,
  ViewFieldGroupExceptionCode,
} from 'src/engine/metadata-modules/view-field-group/exceptions/view-field-group.exception';
import { type UniversalFlatViewFieldGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field-group.type';

export const fromDestroyViewFieldGroupInputToFlatViewFieldGroupOrThrow = ({
  destroyViewFieldGroupInput,
  flatViewFieldGroupMaps,
}: {
  destroyViewFieldGroupInput: DestroyViewFieldGroupInput;
  flatViewFieldGroupMaps: FlatViewFieldGroupMaps;
}): UniversalFlatViewFieldGroup => {
  const { id: viewFieldGroupId } = extractAndSanitizeObjectStringFields(
    destroyViewFieldGroupInput,
    ['id'],
  );

  const existingFlatViewFieldGroupToDestroy =
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: viewFieldGroupId,
      flatEntityMaps: flatViewFieldGroupMaps,
    });

  if (!isDefined(existingFlatViewFieldGroupToDestroy)) {
    throw new ViewFieldGroupException(
      t`View field group to destroy not found`,
      ViewFieldGroupExceptionCode.VIEW_FIELD_GROUP_NOT_FOUND,
    );
  }

  return existingFlatViewFieldGroupToDestroy;
};
