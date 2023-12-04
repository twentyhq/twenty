import { DataSource } from 'typeorm';

// import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const tableName = 'user';

export enum DemoSeedUserIds {
  Noah = '20202020-9e3b-46d4-a556-88b9ddc2b035',
  Hugo = '20202020-3957-4908-9c36-2929a23f8358',
  Julia = '20202020-7169-42cf-bc47-1cfef15264b9',
}

export const seedUsers = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'firstName',
      'lastName',
      'email',
      'passwordHash',
      'defaultWorkspaceId',
    ])
    .orIgnore()
    .values([
      {
        id: DemoSeedUserIds.Noah,
        firstName: 'Noah',
        lastName: 'A',
        email: 'noah@demo.dev',
        passwordHash:
          '$2b$10$66d.6DuQExxnrfI9rMqOg.U1XIYpagr6Lv05uoWLYbYmtK0HDIvS6', // Applecar2025
        defaultWorkspaceId: workspaceId,
      },
      {
        id: DemoSeedUserIds.Hugo,
        firstName: 'Hugo',
        lastName: 'I',
        email: 'hugo@demo.dev',
        passwordHash:
          '$2b$10$66d.6DuQExxnrfI9rMqOg.U1XIYpagr6Lv05uoWLYbYmtK0HDIvS6', // Applecar2025
        defaultWorkspaceId: workspaceId,
      },
      ,
      {
        id: DemoSeedUserIds.Julia,
        firstName: 'Julia',
        lastName: 'S',
        email: 'julia.s@demo.dev',
        passwordHash:
          '$2b$10$66d.6DuQExxnrfI9rMqOg.U1XIYpagr6Lv05uoWLYbYmtK0HDIvS6', // Applecar2025
        defaultWorkspaceId: workspaceId,
      },
    ])
    .execute();
};

export const deleteUsersByWorkspace = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`"${tableName}"."defaultWorkspaceId" = :workspaceId`, {
      workspaceId,
    })
    .execute();
};
