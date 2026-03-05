export const isCallerOverridingEntity = ({
  callerApplicationUniversalIdentifier,
  entityApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  callerApplicationUniversalIdentifier: string;
  entityApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}) =>
  callerApplicationUniversalIdentifier ===
    workspaceCustomApplicationUniversalIdentifier &&
  entityApplicationUniversalIdentifier !==
    workspaceCustomApplicationUniversalIdentifier;
