import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsSearchable() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (target: any): void {
    TypedReflect.defineMetadata(
      'workspace:is-searchable-metadata-args',
      true,
      target,
    );
  };
}
