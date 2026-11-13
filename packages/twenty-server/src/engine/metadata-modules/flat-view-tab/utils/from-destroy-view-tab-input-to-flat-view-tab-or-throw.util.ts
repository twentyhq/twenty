import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewTabMaps } from 'src/engine/metadata-modules/flat-view-tab/types/flat-view-tab-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type DestroyViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/destroy-view-tab.input';
import {
  ViewTabException,
  ViewTabExceptionCode,
} from 'src/engine/metadata-modules/view-tab/exceptions/view-tab.exception';
import { type UniversalFlatViewTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-tab.type';

export const fromDestroyViewTabInputToFlatViewTabOrThrow = ({
  destroyViewTabInput,
  flatViewTabMaps,
}: {
  destroyViewTabInput: DestroyViewTabInput;
  flatViewTabMaps: FlatViewTabMaps;
}): UniversalFlatViewTab => {
  const { id: viewTabId } = extractAndSanitizeObjectStringFields(
    destroyViewTabInput,
    ['id'],
  );

  const existingFlatViewTabToDestroy = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewTabId,
    flatEntityMaps: flatViewTabMaps,
  });

  if (!isDefined(existingFlatViewTabToDestroy)) {
    throw new ViewTabException(
      t`View tab to destroy not found`,
      ViewTabExceptionCode.VIEW_TAB_NOT_FOUND,
    );
  }

  return existingFlatViewTabToDestroy;
};
