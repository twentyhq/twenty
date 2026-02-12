import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { isViewFieldInLowestPosition } from 'src/engine/metadata-modules/flat-view-field/utils/is-view-field-in-lowest-position.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type ValidateLabelIdentifierFieldMetadataIdFlatViewFieldArgs = {
  otherFlatViewFields: UniversalFlatViewField[];
  flatViewFieldToValidate: UniversalFlatViewField;
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
      userFriendlyMessage: msg`Label identifier view field has to be in the lowest position`,
    });
  }

  if (flatViewFieldToValidate.isVisible === false) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Label identifier view field has to be visible`,
      userFriendlyMessage: msg`Label identifier view field has to be visible`,
    });
  }

  if (isDefined(flatViewFieldToValidate.deletedAt)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Label identifier view field cannot be deleted`,
      userFriendlyMessage: msg`Label identifier view field cannot be deleted`,
    });
  }

  return errors;
};
