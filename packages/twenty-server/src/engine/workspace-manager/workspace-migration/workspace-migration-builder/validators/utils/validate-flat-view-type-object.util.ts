import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { VIEW_TYPE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/view/constants/view-type-object-universal-identifier.constant';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateFlatViewTypeObject = ({
  flatView,
}: {
  flatView: Pick<
    UniversalFlatView,
    'type' | 'objectMetadataUniversalIdentifier'
  >;
}): FlatEntityValidationError[] => {
  const viewTypeObjectUniversalIdentifier =
    VIEW_TYPE_OBJECT_UNIVERSAL_IDENTIFIER[flatView.type];

  if (
    !isDefined(viewTypeObjectUniversalIdentifier) ||
    viewTypeObjectUniversalIdentifier ===
      flatView.objectMetadataUniversalIdentifier
  ) {
    return [];
  }

  return [
    {
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`View type is not available on the view object`,
      userFriendlyMessage: msg`This view type is not available on this object`,
    },
  ];
};
