import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ViewExceptionCode } from 'src/engine/core-modules/view/exceptions/view.exception';
import { type FlatViewField } from 'src/engine/core-modules/view/flat-view-field/types/flat-view-field.type';
import { isViewFieldInLowestPosition } from 'src/engine/core-modules/view/flat-view-field/utils/is-view-field-in-lowest-position.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

type ValidateLabelIdentifierFieldMetadataIdFlatViewFieldArgs = {
  otherFlatViewFields: FlatViewField[];
  flatViewFieldToValidate: FlatViewField;
};
export const validateLabelIdentifierFieldMetadataIdFlatViewField = ({
  otherFlatViewFields,
  flatViewFieldToValidate,
}: ValidateLabelIdentifierFieldMetadataIdFlatViewFieldArgs): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  if (
    otherFlatViewFields.length > 0 &&
    !isViewFieldInLowestPosition({
      flatViewField: flatViewFieldToValidate,
      otherFlatViewFields,
    })
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Label identifier view field has to be in the lowest position`,
      userFriendlyMessage: t`Label identifier view field has to be in the lowest position`,
    });
  }

  if (flatViewFieldToValidate.isVisible === false) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Label identifier view field has to be visible`,
      userFriendlyMessage: t`Label identifier view field has to be visible`,
    });
  }

  if (isDefined(flatViewFieldToValidate.deletedAt)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Label identifier view field cannot be deleted`,
      userFriendlyMessage: t`Label identifier view field cannot be deleted`,
    });
  }

  return errors;
};
