import { msg, t } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { VIEW_PRESET_FILTER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/view/constants/view-preset-filter-object-universal-identifier.constant';
import { VIEW_STATUS_PRESET_FILTERS } from 'src/engine/metadata-modules/view/constants/view-status-preset-filters.constant';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateFlatViewPresetFilters = ({
  flatView,
}: {
  flatView: Pick<
    UniversalFlatView,
    'presetFilters' | 'objectMetadataUniversalIdentifier'
  >;
}): FlatEntityValidationError[] => {
  if (!isNonEmptyArray(flatView.presetFilters)) {
    return [];
  }

  const errors: FlatEntityValidationError[] = [];

  const hasPresetFilterOfAnotherObject = flatView.presetFilters.some(
    (presetFilter) =>
      VIEW_PRESET_FILTER_OBJECT_UNIVERSAL_IDENTIFIER[presetFilter] !==
      flatView.objectMetadataUniversalIdentifier,
  );

  if (hasPresetFilterOfAnotherObject) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`View preset filters must belong to the view object`,
      userFriendlyMessage: msg`These preset filters are not available on this object`,
    });
  }

  const hasDuplicatedPresetFilters =
    new Set(flatView.presetFilters).size !== flatView.presetFilters.length;

  if (hasDuplicatedPresetFilters) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`View preset filters must be unique`,
      userFriendlyMessage: msg`A view cannot have the same preset filter twice`,
    });
  }

  const statusPresetFilters = new Set(
    flatView.presetFilters.filter((presetFilter) =>
      VIEW_STATUS_PRESET_FILTERS.includes(presetFilter),
    ),
  );

  if (statusPresetFilters.size > 1) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`View can have at most one status preset filter`,
      userFriendlyMessage: msg`A view can have only one status preset filter`,
    });
  }

  return errors;
};
