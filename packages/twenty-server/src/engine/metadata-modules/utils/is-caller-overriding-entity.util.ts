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
  return (
    callerApplicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier &&
    (entityApplicationUniversalIdentifier !==
      workspaceCustomApplicationUniversalIdentifier ||
      isSystemSideEffect)
  );
};
