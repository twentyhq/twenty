import { queryTestDatabase } from 'test/integration/permissions/access-groups/utils/query-test-database.util';

export const findFieldMetadataIdByName = async ({
  objectMetadataId,
  name,
}: {
  objectMetadataId: string;
  name: string;
}): Promise<string> => {
  const [{ id }] = await queryTestDatabase<{ id: string }>({
    sql: `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = $2`,
    parameters: [objectMetadataId, name],
  });

  return id;
};
