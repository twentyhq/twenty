import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsObjectUIReadOnly() {
  return function (target: object): void {
    TypedReflect.defineMetadata(
      'workspace:is-object-ui-readonly-metadata-args',
      true,
      target,
    );
  };
}
