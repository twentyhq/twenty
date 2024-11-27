import { DataSource } from 'typeorm';

export const checkTableExists = async ({
  dataSource,
  workspaceSchema,
  tableName,
}: {
  dataSource: DataSource;
  workspaceSchema: string;
  tableName: string;
}) => {
  await dataSource
    .query(
      `SELECT EXISTS (
SELECT 1
FROM information_schema.tables 
WHERE table_schema = '${workspaceSchema}'
AND table_name = '${tableName}'
)`,
    )
    .then((result) => {
      expect(result[0].exists).toBe(true);
    });
};

export const checkTableDoesNotExist = async ({
  dataSource,
  workspaceSchema,
  tableName,
}: {
  dataSource: DataSource;
  workspaceSchema: string;
  tableName: string;
}) => {
  await dataSource
    .query(
      `SELECT EXISTS (
  SELECT 1
  FROM information_schema.tables 
  WHERE table_schema = '${workspaceSchema}'
  AND table_name = '${tableName}'
  )`,
    )
    .then((result) => {
      expect(result[0].exists).toBe(false);
    });
};
