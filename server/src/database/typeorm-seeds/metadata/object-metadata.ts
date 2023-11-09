import { DataSource } from 'typeorm';

const tableName = 'objectMetadata';

export const seedObjectMetadata = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'nameSingular',
      'namePlural',
      'labelSingular',
      'labelPlural',
      'targetTableName',
      'description',
      'icon',
      'dataSourceId',
      'workspaceId',
    ])
    .orIgnore()
    .values([
      // Companies
      {
        id: '1a8487a0-480c-434e-b4c7-e22408b97047',
        nameSingular: 'companyV2',
        namePlural: 'companiesV2',
        labelSingular: 'Company',
        labelPlural: 'Companies',
        targetTableName: 'company',
        description: 'A company',
        icon: 'IconBuildingSkyscraper',
        dataSourceId: 'b37b2163-7f63-47a9-b1b3-6c7290ca9fb1',
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      },
      // Views
      {
        id: '9ab6b3dc-767f-473f-8fd0-6cdbefbf8dbe',
        nameSingular: 'viewV2',
        namePlural: 'viewsV2',
        labelSingular: 'View',
        labelPlural: 'Views',
        targetTableName: 'view',
        description: '(System) Views',
        icon: 'IconLayoutCollage',
        dataSourceId: 'b37b2163-7f63-47a9-b1b3-6c7290ca9fb1',
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      },
      // ViewFields
      {
        id: '61d9000b-485c-4c48-a22e-0d9a164f9647',
        nameSingular: 'viewFieldV2',
        namePlural: 'viewFieldsV2',
        labelSingular: 'View Field',
        labelPlural: 'View Fields',
        targetTableName: 'viewField',
        description: '(System) View Fields',
        icon: 'IconColumns3',
        dataSourceId: 'b37b2163-7f63-47a9-b1b3-6c7290ca9fb1',
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      },
      // ViewFilters
      {
        id: '5d9b1ab9-4461-4e2d-bf9e-9b47e68846d3',
        nameSingular: 'viewFilterV2',
        namePlural: 'viewFiltersV2',
        labelSingular: 'View Filter',
        labelPlural: 'View Filters',
        targetTableName: 'viewFilter',
        description: '(System) View Filters',
        icon: 'IconFilterBolt',
        dataSourceId: 'b37b2163-7f63-47a9-b1b3-6c7290ca9fb1',
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      },
      // ViewSorts
      {
        id: '6f8dcd4b-cf28-41dd-b98b-d6e1f5b3a251',
        nameSingular: 'viewSortV2',
        namePlural: 'viewSortsV2',
        labelSingular: 'View Sort',
        labelPlural: 'View Sorts',
        targetTableName: 'viewSort',
        description: '(System) View Sorts',
        icon: 'IconArrowsSort',
        dataSourceId: 'b37b2163-7f63-47a9-b1b3-6c7290ca9fb1',
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      },
    ])
    .execute();
};
