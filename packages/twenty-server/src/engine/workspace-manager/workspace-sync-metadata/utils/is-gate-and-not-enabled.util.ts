import { Gate } from 'src/engine/twenty-orm/interfaces/gate.interface';

export const isGatedAndNotEnabled = (
  gate: Gate | undefined,
  workspaceFeatureFlagsMap: Record<string, boolean>,
): boolean => {
  const featureFlagValue =
    gate?.featureFlag && workspaceFeatureFlagsMap[gate.featureFlag];

  return gate?.featureFlag !== undefined && !featureFlagValue;
};
