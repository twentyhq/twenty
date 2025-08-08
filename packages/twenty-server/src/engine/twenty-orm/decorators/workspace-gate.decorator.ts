import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { isPublicFeatureFlag } from 'src/engine/core-modules/lab/utils/is-public-feature-flag.util';
import { TypedReflect } from 'src/utils/typed-reflect';

export interface WorkspaceGateOptions {
  featureFlag: string;
  excludeFromDatabase?: boolean;
  excludeFromWorkspaceApi?: boolean;
}

export function WorkspaceGate(options: WorkspaceGateOptions) {
  const flagKey = options.featureFlag as FeatureFlagKey;

  if (isPublicFeatureFlag(flagKey)) {
    throw new Error(
      `Public feature flag "${flagKey}" cannot be used to gate entities. ` +
        'Public flags should not be used for entity gating as they can be toggled by users.',
    );
  }

  const gateOptions = {
    featureFlag: options.featureFlag,
    excludeFromDatabase: options.excludeFromDatabase ?? true,
    excludeFromWorkspaceApi: options.excludeFromWorkspaceApi ?? true,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, propertyKey?: string | symbol) => {
    if (propertyKey !== undefined) {
      TypedReflect.defineMetadata(
        'workspace:gate-metadata-args',
        gateOptions,
        target,
        propertyKey.toString(),
      );
    } else {
      TypedReflect.defineMetadata(
        'workspace:gate-metadata-args',
        gateOptions,
        target,
      );
    }
  };
}
