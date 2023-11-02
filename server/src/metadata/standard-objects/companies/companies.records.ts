import { DataSource } from 'typeorm';

const tableName = 'company';

export const seedCompanies = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
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
    .execute();
};
