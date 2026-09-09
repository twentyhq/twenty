// Applications never override: they write their own columns, so only the
// workspace custom application can author an override. It does so on any
// entity it does not own, and on the engine-minted rows that carry its
// identifier but whose lifecycle the engine manages.
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
