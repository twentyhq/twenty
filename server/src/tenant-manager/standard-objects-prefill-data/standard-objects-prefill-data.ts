import { DataSource, EntityManager } from 'typeorm';

export const standardObjectsPrefillData = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  workspaceDataSource.transaction(async (entityManager: EntityManager) => {
    const createdCompanies = await entityManager
      .createQueryBuilder()
      .insert()
      .into(`${schemaName}.company`, [
        'name',
        'domainName',
        'address',
        'employees',
      ])
      .orIgnore()
      .values([
        {
          name: 'Airbnb',
          domainName: 'airbnb.com',
          address: 'San Francisco',
          employees: 5000,
        },
        {
          name: 'Qonto',
          domainName: 'qonto.com',
          address: 'San Francisco',
          employees: 800,
        },
        {
          name: 'Stripe',
          domainName: 'stripe.com',
          address: 'San Francisco',
          employees: 8000,
        },
        {
          name: 'Figma',
          domainName: 'figma.com',
          address: 'San Francisco',
          employees: 800,
        },
        {
          name: 'Notion',
          domainName: 'notion.com',
          address: 'San Francisco',
          employees: 400,
        },
      ])
      .returning('*')
      .execute();

    const companyIdMap = createdCompanies.raw.reduce((acc, view) => {
      acc[view.name] = view.id;
      return acc;
    }, {});

    const createdViews = await entityManager
      .createQueryBuilder()
      .insert()
      .into(`${schemaName}.view`, ['name', 'objectId', 'type'])
      .orIgnore()
      .values([
        {
          name: 'All companies',
          objectId: 'company',
          type: 'table',
        },
        {
          name: 'All people',
          objectId: 'person',
          type: 'table',
        },
        {
          name: 'All opportunities',
          objectId: 'company',
          type: 'kanban',
        },
        {
          name: 'All Companies (V2)',
          objectId: companyIdMap['Airbnb'],
          type: 'table',
        },
      ])
      .returning('*')
      .execute();

    const viewIdMap = createdViews.raw.reduce((acc, view) => {
      acc[view.name] = view.id;
      return acc;
    }, {});

    await entityManager
      .createQueryBuilder()
      .insert()
      .into(`${schemaName}.viewField`, [
        'fieldId',
        'viewId',
        'position',
        'isVisible',
        'size',
      ])
      .orIgnore()
      .values([
        {
          fieldId: 'name',
          viewId: viewIdMap['All Companies (V2)'],
          position: 0,
          isVisible: true,
          size: 180,
        },
        {
          fieldId: 'name',
          viewId: viewIdMap['All companies'],
          position: 0,
          isVisible: true,
          size: 180,
        },
        {
          fieldId: 'domainName',
          viewId: viewIdMap['All companies'],
          position: 1,
          isVisible: true,
          size: 100,
        },
        {
          fieldId: 'accountOwner',
          viewId: viewIdMap['All companies'],
          position: 2,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'createdAt',
          viewId: viewIdMap['All companies'],
          position: 3,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'employees',
          viewId: viewIdMap['All companies'],
          position: 4,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'linkedin',
          viewId: viewIdMap['All companies'],
          position: 5,
          isVisible: true,
          size: 170,
        },
        {
          fieldId: 'address',
          viewId: viewIdMap['All companies'],
          position: 6,
          isVisible: true,
          size: 170,
        },
        {
          fieldId: 'displayName',
          viewId: viewIdMap['All people'],
          position: 0,
          isVisible: true,
          size: 210,
        },
        {
          fieldId: 'email',
          viewId: viewIdMap['All people'],
          position: 1,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'company',
          viewId: viewIdMap['All people'],
          position: 2,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'phone',
          viewId: viewIdMap['All people'],
          position: 3,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'createdAt',
          viewId: viewIdMap['All people'],
          position: 4,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'city',
          viewId: viewIdMap['All people'],
          position: 5,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'jobTitle',
          viewId: viewIdMap['All people'],
          position: 6,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'linkedin',
          viewId: viewIdMap['All people'],
          position: 7,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'x',
          viewId: viewIdMap['All people'],
          position: 8,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'amount',
          viewId: viewIdMap['All opportunities'],
          position: 0,
          isVisible: true,
          size: 180,
        },
        {
          fieldId: 'probability',
          viewId: viewIdMap['All opportunities'],
          position: 1,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'closeDate',
          viewId: viewIdMap['All opportunities'],
          position: 2,
          isVisible: true,
          size: 100,
        },
        {
          fieldId: 'company',
          viewId: viewIdMap['All opportunities'],
          position: 3,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'createdAt',
          viewId: viewIdMap['All opportunities'],
          position: 4,
          isVisible: true,
          size: 150,
        },
        {
          fieldId: 'pointOfContact',
          viewId: viewIdMap['All opportunities'],
          position: 5,
          isVisible: true,
          size: 150,
        },
      ])
      .execute();
  });
};
