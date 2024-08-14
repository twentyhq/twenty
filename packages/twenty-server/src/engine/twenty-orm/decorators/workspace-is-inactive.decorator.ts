import { TypedReflect } from 'src/utils/typed-reflect';

export function isInactive(): PropertyDecorator {
  return (object, propertyKey) => {
    TypedReflect.defineMetadata(
      'workspace:is-inactive-field-metadata-args',
      true,
      object,
      propertyKey.toString(),
    );
  };
}
