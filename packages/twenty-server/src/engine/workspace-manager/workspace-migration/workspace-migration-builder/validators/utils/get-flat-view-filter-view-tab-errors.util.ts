import { msg, t } from '@lingui/core/macro';
import { ViewTabType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewFilterExceptionCode } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatViewFilter } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const getFlatViewFilterViewTabErrors = ({
  viewFilter,
  flatViewTabMaps,
}: {
  viewFilter: Pick<
    UniversalFlatViewFilter,
    'viewTabUniversalIdentifier' | 'viewUniversalIdentifier'
  >;
  flatViewTabMaps: MetadataUniversalFlatEntityMaps<'viewTab'>;
}): FlatEntityValidationError[] => {
  if (!isDefined(viewFilter.viewTabUniversalIdentifier)) {
    return [];
  }

  const referencedViewTab = findFlatEntityByUniversalIdentifier({
    universalIdentifier: viewFilter.viewTabUniversalIdentifier,
    flatEntityMaps: flatViewTabMaps,
  });

  if (!isDefined(referencedViewTab)) {
    return [
      {
        code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        message: t`View tab not found`,
        userFriendlyMessage: msg`View tab not found`,
      },
    ];
  }

  const errors: FlatEntityValidationError[] = [];

  if (
    referencedViewTab.viewUniversalIdentifier !==
    viewFilter.viewUniversalIdentifier
  ) {
    errors.push({
      code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
      message: t`View filter and view tab must belong to the same view`,
      userFriendlyMessage: msg`View filter and view tab must belong to the same view`,
    });
  }

  if (referencedViewTab.type !== ViewTabType.CUSTOM) {
    errors.push({
      code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
      message: t`View filters can only belong to a custom tab`,
      userFriendlyMessage: msg`View filters can only belong to a custom tab`,
    });
  }

  return errors;
};
