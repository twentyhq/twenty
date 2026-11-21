import { queryTestDatabase } from 'test/integration/permissions/access-groups/utils/query-test-database.util';

export const findInverseFieldMetadataId = async ({
  fieldMetadataId,
}: {
  fieldMetadataId: string;
}): Promise<string> => {
  const [{ relationTargetFieldMetadataId }] = await queryTestDatabase<{
    relationTargetFieldMetadataId: string;
  }>({
    sql: `SELECT "relationTargetFieldMetadataId" FROM core."fieldMetadata" WHERE "id" = $1`,
    parameters: [fieldMetadataId],
  });

  return relationTargetFieldMetadataId;
};
