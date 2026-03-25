import {
  type ValidationArguments,
  type ValidationOptions,
  registerDecorator,
} from 'class-validator';

const graphQLEnumNameRegex = /^[_A-Za-z][_0-9A-Za-z]*$/;

export const IsValidGraphQLEnumName =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isValidGraphQLEnumName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => {
          return typeof value === 'string' && graphQLEnumNameRegex.test(value);
        },
        defaultMessage: (args: ValidationArguments) => {
          return `${args.property} must match the ${graphQLEnumNameRegex} format`;
        },
      },
    });
  };
