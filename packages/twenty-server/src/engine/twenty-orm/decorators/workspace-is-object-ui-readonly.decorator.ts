import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsObjectUIReadOnly() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (target: any): void {
    TypedReflect.defineMetadata(
      'workspace:is-object-ui-readonly-metadata-args',
      true,
      target,
    );
  };
}
