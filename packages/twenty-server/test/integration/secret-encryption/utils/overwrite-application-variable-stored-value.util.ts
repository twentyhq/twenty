export const overwriteApplicationVariableStoredValue = async ({
  applicationId,
  key,
  storedValue,
}: {
  applicationId: string;
  key: string;
  storedValue: string;
}): Promise<void> => {
  await global.testDataSource.query(
    `UPDATE core."applicationVariable"
        SET "value" = $1
      WHERE "applicationId" = $2 AND "key" = $3`,
    [storedValue, applicationId, key],
  );
};
