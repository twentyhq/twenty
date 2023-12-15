export const isGatedAndNotEnabled = (
  metadata,
  workspaceFeatureFlagsMap: Record<string, boolean>,
): boolean => {
  const featureFlagValue =
    metadata.gate?.featureFlag &&
    workspaceFeatureFlagsMap[metadata.gate.featureFlag];

  return metadata.gate?.featureFlag !== undefined && !featureFlagValue;
};
