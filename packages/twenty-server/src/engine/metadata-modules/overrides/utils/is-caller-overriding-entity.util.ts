export const isCallerOverridingEntity = ({
  callerApplicationUniversalIdentifier,
  entityApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
  isSystemSideEffect,
}: {
  callerApplicationUniversalIdentifier: string;
  entityApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
  isSystemSideEffect: boolean;
}): boolean => {
  const isCallerWorkspaceCustomApplication =
    callerApplicationUniversalIdentifier ===
    workspaceCustomApplicationUniversalIdentifier;
  const isEntityOwnedByWorkspaceCustomApplication =
    entityApplicationUniversalIdentifier ===
    workspaceCustomApplicationUniversalIdentifier;
  const isEntityEngineManaged = isSystemSideEffect;

  if (!isCallerWorkspaceCustomApplication) {
    return false;
  }

  return !isEntityOwnedByWorkspaceCustomApplication || isEntityEngineManaged;
};
