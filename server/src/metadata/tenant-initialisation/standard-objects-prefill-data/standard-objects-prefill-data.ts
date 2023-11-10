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
      .into(`${schemaName}.view`, ['name', 'objectMetadataId', 'type'])
      .orIgnore()
      .values([
        {
          name: 'All companies',
          objectMetadataId: 'company',
          type: 'table',
        },
        {
          name: 'All people',
          objectMetadataId: 'person',
          type: 'table',
        },
        {
          name: 'All opportunities',
          objectMetadataId: 'company',
          type: 'kanban',
        },
        {
          name: 'All Companies (V2)',
          objectMetadataId: companyIdMap['Airbnb'],
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
        'fieldMetadataId',
        'viewId',
        'position',
        'isVisible',
        'size',
      ])
      .orIgnore()
      .values([
        {
          fieldMetadataId: 'name',
          viewId: viewIdMap['All Companies (V2)'],
          position: 0,
          isVisible: true,
          size: 180,
        },
        {
          fieldMetadataId: 'name',
          viewId: viewIdMap['All companies'],
          position: 0,
          isVisible: true,
          size: 180,
        },
        {
          fieldMetadataId: 'domainName',
          viewId: viewIdMap['All companies'],
          position: 1,
          isVisible: true,
          size: 100,
        },
        {
          fieldMetadataId: 'accountOwner',
          viewId: viewIdMap['All companies'],
          position: 2,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'createdAt',
          viewId: viewIdMap['All companies'],
          position: 3,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'employees',
          viewId: viewIdMap['All companies'],
          position: 4,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'linkedin',
          viewId: viewIdMap['All companies'],
          position: 5,
          isVisible: true,
          size: 170,
        },
        {
          fieldMetadataId: 'address',
          viewId: viewIdMap['All companies'],
          position: 6,
          isVisible: true,
          size: 170,
        },
        {
          fieldMetadataId: 'displayName',
          viewId: viewIdMap['All people'],
          position: 0,
          isVisible: true,
          size: 210,
        },
        {
          fieldMetadataId: 'email',
          viewId: viewIdMap['All people'],
          position: 1,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'company',
          viewId: viewIdMap['All people'],
          position: 2,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'phone',
          viewId: viewIdMap['All people'],
          position: 3,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'createdAt',
          viewId: viewIdMap['All people'],
          position: 4,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'city',
          viewId: viewIdMap['All people'],
          position: 5,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'jobTitle',
          viewId: viewIdMap['All people'],
          position: 6,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'linkedin',
          viewId: viewIdMap['All people'],
          position: 7,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'x',
          viewId: viewIdMap['All people'],
          position: 8,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'amount',
          viewId: viewIdMap['All opportunities'],
          position: 0,
          isVisible: true,
          size: 180,
        },
        {
          fieldMetadataId: 'probability',
          viewId: viewIdMap['All opportunities'],
          position: 1,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'closeDate',
          viewId: viewIdMap['All opportunities'],
          position: 2,
          isVisible: true,
          size: 100,
        },
        {
          fieldMetadataId: 'company',
          viewId: viewIdMap['All opportunities'],
          position: 3,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'createdAt',
          viewId: viewIdMap['All opportunities'],
          position: 4,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId: 'pointOfContact',
          viewId: viewIdMap['All opportunities'],
          position: 5,
          isVisible: true,
          size: 150,
        },
      ])
      .execute();
  });
};
