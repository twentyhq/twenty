export const isCallerOverridingEntity = ({
  callerApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
  entityIsSystemSideEffect,
}: {
  callerApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
  entityIsSystemSideEffect: boolean;
}): boolean => {
  return (
    callerApplicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier && entityIsSystemSideEffect
  );
};
