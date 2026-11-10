import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { isDefined } from 'twenty-shared/utils';

@ValidatorConstraint({ async: false })
export class ExactlyOneOfConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments) {
    const [properties] = args.constraints as [string[]];
    const object = args.object as Record<string, unknown>;

    return (
      properties.filter((property) => isDefined(object[property])).length === 1
    );
  }

  defaultMessage(args: ValidationArguments) {
    const [properties] = args.constraints as [string[]];

    return `Exactly one of the following properties must be provided: ${properties.join(', ')}`;
  }
}

export const ExactlyOneOf = (
  properties: string[],
  validationOptions?: ValidationOptions,
): ClassDecorator => {
  return (target) => {
    registerDecorator({
      target,
      // a property of its own, so @IsOptional() on the listed ones does not skip it
      propertyName: properties.join('|'),
      options: validationOptions,
      constraints: [properties],
      validator: ExactlyOneOfConstraint,
    });
  };
};
