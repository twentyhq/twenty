import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class NotInConstraint implements ValidatorConstraintInterface {
  private expressionsList: Array<string | RegExp>;

  constructor() {}

  validate(value: string, validationArguments: ValidationArguments) {
    this.expressionsList = validationArguments.constraints[0];

    for (const elm of this.expressionsList) {
      if (typeof elm === 'string') {
        if (elm.toLowerCase() === value.toLowerCase()) {
          return false;
        }
      }

      if (elm instanceof RegExp) {
        if (elm.test(value)) {
          return false;
        }
      }
    }

    return true;
  }

  defaultMessage() {
    return `${Array.from(this.expressionsList).join(', ')} are not allowed`;
  }
}

export function NotIn(
  expressionsList: Array<string | RegExp>,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [expressionsList],
      validator: NotInConstraint,
    });
  };
}
