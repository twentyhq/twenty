import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsNullable(): PropertyDecorator {
  return (object, propertyKey) => {
    TypedReflect.defineMetadata(
      'workspace:is-nullable-metadata-args',
      true,
      object,
      propertyKey.toString(),
    );
  };
}
