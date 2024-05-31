import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const graphQLEnumNameRegex = /^[_A-Za-z][_0-9A-Za-z]*$/;

export function IsValidGraphQLEnumName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidGraphQLEnumName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && graphQLEnumNameRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must match the ${graphQLEnumNameRegex} format`;
        },
      },
    });
  };
}
