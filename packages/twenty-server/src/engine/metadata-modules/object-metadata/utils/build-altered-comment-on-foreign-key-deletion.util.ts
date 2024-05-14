import { DataSource } from 'typeorm';

export const buildAlteredCommentOnForeignKeyDeletion = async (
  localObjectMetadataName: string,
  remoteObjectMetadataName: string,
  schema: string,
  workspaceDataSource: DataSource | undefined,
): Promise<string | null> => {
  const existingComment = await workspaceDataSource?.query(
    `SELECT col_description('${schema}."${localObjectMetadataName}"'::regclass, 0)`,
  );

  if (!existingComment[0]?.col_description) {
    return null;
  }

  const commentWithoutGraphQL = existingComment[0].col_description
    .replace('@graphql(', '')
    .replace(')', '');

  const parsedComment = JSON.parse(commentWithoutGraphQL);

  const currentForeignKeys = parsedComment.foreign_keys;

  if (!currentForeignKeys) {
    return null;
  }

  const updatedForeignKeys = currentForeignKeys.filter(
    (foreignKey: any) =>
      foreignKey.foreign_name !== remoteObjectMetadataName &&
      foreignKey.foreign_table !== remoteObjectMetadataName,
  );

  parsedComment.foreign_keys = updatedForeignKeys;

  return `@graphql(${JSON.stringify(parsedComment)})`;
};
