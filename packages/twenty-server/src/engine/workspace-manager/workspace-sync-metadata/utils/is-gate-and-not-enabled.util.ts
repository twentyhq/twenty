import { type Gate } from 'src/engine/twenty-orm/interfaces/gate.interface';

export type GateContext = 'database' | 'workspaceApi';

export const isGatedAndNotEnabled = (
  gate: Gate | undefined,
  workspaceFeatureFlagsMap: Record<string, boolean>,
  context?: GateContext,
): boolean => {
  // If no gate, not gated
  if (!gate?.featureFlag) {
    return false;
  }

  // Check if explicitly excluded from the specific context
  switch (context) {
    case 'database':
      if (gate.excludeFromDatabase === false) {
        return false; // Not gated for database
      }
      break;
    case 'workspaceApi':
      if (gate.excludeFromWorkspaceApi === false) {
        return false; // Not gated for workspace API
      }
      break;
  }

  // If context-specific exclusion is true or undefined (default behavior), check the flag
  const featureFlagValue = workspaceFeatureFlagsMap[gate.featureFlag];

  return !featureFlagValue;
};
