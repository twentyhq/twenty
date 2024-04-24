import { TypedReflect } from 'src/utils/typed-reflect';

export interface WorkspaceGateOptions {
  featureFlag: string;
}

export function WorkspaceGate(options: WorkspaceGateOptions) {
  return function (target: object, fieldKey?: string) {
    if (fieldKey) {
      TypedReflect.defineMetadata(
        'workspace:gate-metadata-args',
        options,
        target,
        fieldKey,
      );
    } else {
      TypedReflect.defineMetadata(
        'workspace:gate-metadata-args',
        options,
        target,
      );
    }
  };
}
