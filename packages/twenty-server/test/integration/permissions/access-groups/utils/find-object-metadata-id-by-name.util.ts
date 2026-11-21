import { queryTestDatabase } from 'test/integration/permissions/access-groups/utils/query-test-database.util';

export const findObjectMetadataIdByName = async ({
  workspaceId,
  nameSingular,
}: {
  workspaceId: string;
  nameSingular: string;
}): Promise<string> => {
  const [{ id }] = await queryTestDatabase<{ id: string }>({
    sql: `SELECT "id" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = $2`,
    parameters: [workspaceId, nameSingular],
  });

  return id;
};
