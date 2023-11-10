import { DataSource } from 'typeorm';

const tableName = 'viewField';

export const seedViewFields = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'fieldId',
      'viewId',
      'position',
      'isVisible',
      'size',
    ])
    .orIgnore()
    .values([
      {
        id: '46a72a5b-276e-4241-a05f-c054410aebcb',
        fieldId: 'name',
        viewId: '10bec73c-0aea-4cc4-a3b2-8c2186f29b43',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        id: 'f15b26ff-8f79-49dd-8f53-4286dd1af846',
        fieldId: 'name',
        viewId: '37a8a866-eb17-4e76-9382-03143a2f6a80',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        id: '8d1dbb50-c97f-42c4-8575-3d2c9bdeb6e5',
        fieldId: 'domainName',
        viewId: '37a8a866-eb17-4e76-9382-03143a2f6a80',
        position: 1,
        isVisible: true,
        size: 100,
      },
      {
        id: '33833b3b-4e02-4f10-91fc-c594422952af',
        fieldId: 'accountOwner',
        viewId: '37a8a866-eb17-4e76-9382-03143a2f6a80',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        id: 'c750a968-832e-4812-a1a2-74f515af55c1',
        fieldId: 'createdAt',
        viewId: '37a8a866-eb17-4e76-9382-03143a2f6a80',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        id: '2fde3187-a0bc-47ca-80bd-457bd826fb4a',
        fieldId: 'employees',
        viewId: '37a8a866-eb17-4e76-9382-03143a2f6a80',
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        id: '2fead26f-3f4f-4a4d-a4c6-3abe7b2f74c9',
        fieldId: 'linkedin',
        viewId: '37a8a866-eb17-4e76-9382-03143a2f6a80',
        position: 5,
        isVisible: true,
        size: 170,
      },
      {
        id: '0cffa82a-c851-4e17-b46c-2c4642d78329',
        fieldId: 'address',
        viewId: '37a8a866-eb17-4e76-9382-03143a2f6a80',
        position: 6,
        isVisible: true,
        size: 170,
      },
      {
        id: '93a68c4a-8107-409a-9adb-06305ffbd692',
        fieldId: 'displayName',
        viewId: '6095799e-b48f-4e00-b071-10818083593a',
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        id: 'd955ee31-6316-4cb2-af71-9609dede4d7e',
        fieldId: 'email',
        viewId: '6095799e-b48f-4e00-b071-10818083593a',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        id: 'bceb4d84-8ad1-4a0e-9333-efb870b42eb8',
        fieldId: 'company',
        viewId: '6095799e-b48f-4e00-b071-10818083593a',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        id: 'bef874d4-f349-4cdb-ae28-6e9fc497449b',
        fieldId: 'phone',
        viewId: '6095799e-b48f-4e00-b071-10818083593a',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        id: 'e06f920d-1af9-404d-8b9a-4f97c4009a4a',
        fieldId: 'createdAt',
        viewId: '6095799e-b48f-4e00-b071-10818083593a',
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        id: '92d94ee8-31fc-4025-a427-29291abb2b19',
        fieldId: 'city',
        viewId: '6095799e-b48f-4e00-b071-10818083593a',
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        id: 'b38e4022-1559-40da-bd5e-29d89b6c8330',
        fieldId: 'jobTitle',
        viewId: '6095799e-b48f-4e00-b071-10818083593a',
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        id: '30147fab-9666-4db5-a11b-20af4544c712',
        fieldId: 'linkedin',
        viewId: '6095799e-b48f-4e00-b071-10818083593a',
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        id: 'f0870949-21ac-46a2-b3ec-d1b0107c434c',
        fieldId: 'x',
        viewId: '6095799e-b48f-4e00-b071-10818083593a',
        position: 8,
        isVisible: true,
        size: 150,
      },
    ])
    .execute();
};
