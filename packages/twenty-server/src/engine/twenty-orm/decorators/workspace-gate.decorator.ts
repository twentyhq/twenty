import { TypedReflect } from 'src/utils/typed-reflect';

export interface WorkspaceGateOptions {
  featureFlag: string;
}

export function WorkspaceGate(options: WorkspaceGateOptions) {
  return (target: any, propertyKey?: string | symbol) => {
    if (propertyKey !== undefined) {
      TypedReflect.defineMetadata(
        'workspace:gate-metadata-args',
        options,
        target,
        propertyKey.toString(),
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
