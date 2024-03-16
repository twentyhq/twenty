import { GateDecoratorParams } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/gate-decorator.interface';

export const isGatedAndNotEnabled = (
  gate: GateDecoratorParams | undefined,
  workspaceFeatureFlagsMap: Record<string, boolean>,
): boolean => {
  const featureFlagValue =
    gate?.featureFlag && workspaceFeatureFlagsMap[gate.featureFlag];

  return gate?.featureFlag !== undefined && !featureFlagValue;
};
