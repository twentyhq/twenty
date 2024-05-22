import { buildAlteredCommentOnForeignKeyDeletion } from 'src/engine/metadata-modules/object-metadata/utils/create-migration-for-foreign-key-comment-alteration.util';

describe('buildAlteredCommentOnForeignKeyDeletion', () => {
  const localObjectMetadataName = 'favorite';
  const remoteObjectMetadataName = 'blog';
  const schema = 'schema';
  const workspaceDataSource = {
    query: jest.fn(),
  };

  it('should return null if no comment ', async () => {
    workspaceDataSource.query.mockResolvedValueOnce([]);

    const result = await buildAlteredCommentOnForeignKeyDeletion(
      localObjectMetadataName,
      remoteObjectMetadataName,
      schema,
      workspaceDataSource as any,
    );

    expect(result).toBeNull();
  });

  it('should return null if the existing comment does not contain foreign keys', async () => {
    workspaceDataSource.query.mockResolvedValueOnce([
      { col_description: '@graphql({"totalCount":{"enabled":true}})' },
    ]);

    const result = await buildAlteredCommentOnForeignKeyDeletion(
      localObjectMetadataName,
      remoteObjectMetadataName,
      schema,
      workspaceDataSource as any,
    );

    expect(result).toBeNull();
  });

  it('should return altered comment without foreign key', async () => {
    const existingComment = {
      col_description: `@graphql({"totalCount":{"enabled":true},"foreign_keys":[{"local_name":"favoriteCollection","local_columns":["${remoteObjectMetadataName}Id"],"foreign_name":"${remoteObjectMetadataName}","foreign_schema":"schema","foreign_table":"${remoteObjectMetadataName}","foreign_columns":["id"]}]})`,
    };

    workspaceDataSource.query.mockResolvedValueOnce([existingComment]);

    const result = await buildAlteredCommentOnForeignKeyDeletion(
      localObjectMetadataName,
      remoteObjectMetadataName,
      schema,
      workspaceDataSource as any,
    );

    expect(result).toBe(
      '@graphql({"totalCount":{"enabled":true},"foreign_keys":[]})',
    );
  });

  it('should return altered comment without the input foreign key', async () => {
    const existingComment = {
      col_description: `@graphql({"totalCount":{"enabled":true},"foreign_keys":[{"local_name":"favoriteCollection","local_columns":["${remoteObjectMetadataName}Id"],"foreign_name":"${remoteObjectMetadataName}","foreign_schema":"schema","foreign_table":"${remoteObjectMetadataName}","foreign_columns":["id"]}, {"local_name":"favoriteCollection","local_columns":["testId"],"foreign_name":"test","foreign_schema":"schema","foreign_table":"test","foreign_columns":["id"]}]})`,
    };

    workspaceDataSource.query.mockResolvedValueOnce([existingComment]);

    const result = await buildAlteredCommentOnForeignKeyDeletion(
      localObjectMetadataName,
      remoteObjectMetadataName,
      schema,
      workspaceDataSource as any,
    );

    expect(result).toBe(
      '@graphql({"totalCount":{"enabled":true},"foreign_keys":[{"local_name":"favoriteCollection","local_columns":["testId"],"foreign_name":"test","foreign_schema":"schema","foreign_table":"test","foreign_columns":["id"]}]})',
    );
  });
});
