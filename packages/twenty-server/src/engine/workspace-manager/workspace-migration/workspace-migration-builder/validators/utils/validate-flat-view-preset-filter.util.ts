import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { VIEW_PRESET_FILTER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/view/constants/view-preset-filter-object-universal-identifier.constant';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateFlatViewPresetFilter = ({
  flatView,
}: {
  flatView: Pick<
    UniversalFlatView,
    'presetFilter' | 'objectMetadataUniversalIdentifier'
  >;
}): FlatEntityValidationError[] => {
  if (!isDefined(flatView.presetFilter)) {
    return [];
  }

  if (
    VIEW_PRESET_FILTER_OBJECT_UNIVERSAL_IDENTIFIER[flatView.presetFilter] ===
    flatView.objectMetadataUniversalIdentifier
  ) {
    return [];
  }

  return [
    {
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`View preset filter must belong to the view object`,
      userFriendlyMessage: msg`This preset filter is not available on this object`,
    },
  ];
};
