import { DataSource } from 'typeorm';

const tableName = 'workspaceMember';

const WorkspaceMemberIds = {
  Tim: '20202020-0687-4c41-b707-ed1bfca972a7',
  Jony: '20202020-77d5-4cb6-b60a-f4a835a85d61',
  Phil: '20202020-1553-45c6-a028-5a9064cce07f',
};

const WorkspaceMemberUserIds = {
  Tim: '20202020-a838-4fa9-b59b-96409b9a1c30',
  Jony: '20202020-c231-45c5-b9f2-cf8b70191f6d',
  Phil: '20202020-ef2e-45df-b677-32fa06d4bd2a',
};

export const seedWorkspaceMember = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'nameFirstName',
      'nameLastName',
      'locale',
      'colorScheme',
      'allowImpersonation',
      'userId',
    ])
    .orIgnore()
    .values([
      {
        id: WorkspaceMemberIds.Tim,
        nameFirstName: 'Tim',
        nameLastName: 'Apple',
        locale: 'en',
        colorScheme: 'Light',
        allowImpersonation: true,
        userId: WorkspaceMemberUserIds.Tim,
      },
      {
        id: WorkspaceMemberIds.Jony,
        nameFirstName: 'Jony',
        nameLastName: 'Ive',
        locale: 'en',
        colorScheme: 'Light',
        allowImpersonation: true,
        userId: WorkspaceMemberUserIds.Jony,
      },
      {
        id: WorkspaceMemberIds.Phil,
        nameFirstName: 'Phil',
        nameLastName: 'Shiler',
        locale: 'en',
        colorScheme: 'Light',
        allowImpersonation: true,
        userId: WorkspaceMemberUserIds.Tim,
      },
    ])
    .execute();
};
