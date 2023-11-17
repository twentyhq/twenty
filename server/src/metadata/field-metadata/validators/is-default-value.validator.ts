import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

import { validateDefaultValueBasedOnType } from 'src/metadata/field-metadata/utils/validate-default-value-based-on-type.util';

export const IsDefaultValue = (validationOptions?: ValidationOptions) => {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isDefaultValue',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Extract type value from the object
          const type = (args.object as any)['type'];

          return validateDefaultValueBasedOnType(value, type);
        },
      },
    });
  };
};
