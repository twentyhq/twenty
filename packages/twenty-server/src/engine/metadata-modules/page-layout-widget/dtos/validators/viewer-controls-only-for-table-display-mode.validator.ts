import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { isDefined } from 'twenty-shared/utils';

import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';

@ValidatorConstraint({ async: false })
export class ViewerControlsOnlyForTableDisplayModeConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, validationArguments: ValidationArguments) {
    if (!isDefined(value)) {
      return true;
    }

    const configuration = validationArguments.object as {
      fieldDisplayMode?: FieldDisplayMode;
    };

    return configuration.fieldDisplayMode === FieldDisplayMode.TABLE;
  }

  defaultMessage() {
    return `viewerControls is only supported when fieldDisplayMode is ${FieldDisplayMode.TABLE}`;
  }
}

export const ViewerControlsOnlyForTableDisplayMode = (
  validationOptions?: ValidationOptions,
): PropertyDecorator => {
  return (target, propertyName) => {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      validator: ViewerControlsOnlyForTableDisplayModeConstraint,
    });
  };
};
