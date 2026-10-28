export type ApplicationRegistrationRow = {
  id: string;
  name: string;
  sourcePackage: string | null;
  latestAvailableVersion: string | null;
  isOfficial: boolean;
  logoFileId: string | null;
};

export const findApplicationRegistrationByUniversalIdentifier = async ({
  universalIdentifier,
}: {
  universalIdentifier: string;
}): Promise<ApplicationRegistrationRow | null> => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT id, name, "sourcePackage", "latestAvailableVersion", "isOfficial",
            "logoFileId"
     FROM core."applicationRegistration"
     WHERE "universalIdentifier" = $1`,
    [universalIdentifier],
  );

  return row ?? null;
};
