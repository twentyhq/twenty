export const isCallerOverridingEntity = ({
  callerApplicationUniversalIdentifier,
  entityApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  callerApplicationUniversalIdentifier: string;
  entityApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): boolean => {
  return (
    callerApplicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier &&
    entityApplicationUniversalIdentifier !==
      workspaceCustomApplicationUniversalIdentifier
  );
};
