import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsPrimaryField(): PropertyDecorator {
  return (object, propertyKey) => {
    TypedReflect.defineMetadata(
      'workspace:is-primary-field-metadata-args',
      true,
      object,
      propertyKey.toString(),
    );
  };
}
