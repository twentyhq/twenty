export const insertApplication = async ({
  universalIdentifier,
  name,
  workspaceId,
  applicationRegistrationId,
}: {
  universalIdentifier: string;
  name: string;
  workspaceId: string;
  applicationRegistrationId: string;
}): Promise<string> => {
  const [{ id }] = await globalThis.testDataSource.query(
    `INSERT INTO core."application"
       ("universalIdentifier", name, "sourcePath", "workspaceId",
        "applicationRegistrationId")
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      universalIdentifier,
      name,
      name.toLowerCase().replace(/\s+/g, '-'),
      workspaceId,
      applicationRegistrationId,
    ],
  );

  return id;
};
