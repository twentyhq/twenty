import { DataSource } from 'typeorm';

const tableName = 'company';

export const seedCompanies = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['id', 'name', 'domainName', 'address'])
    .orIgnore()
    .values([
      {
        id: 'fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
        name: 'Linkedin',
        domainName: 'linkedin.com',
        address: '',
      },
      {
        id: '118995f3-5d81-46d6-bf83-f7fd33ea6102',
        name: 'Facebook',
        domainName: 'facebook.com',
        address: '',
      },
      {
        id: '04b2e9f5-0713-40a5-8216-82802401d33e',
        name: 'Qonto',
        domainName: 'qonto.com',
        address: '',
      },
      {
        id: '460b6fb1-ed89-413a-b31a-962986e67bb4',
        name: 'Microsoft',
        domainName: 'microsoft.com',
        address: '',
      },
      {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
        name: 'Airbnb',
        domainName: 'airbnb.com',
        address: '',
      },
      {
        id: '0d940997-c21e-4ec2-873b-de4264d89025',
        name: 'Google',
        domainName: 'google.com',
        address: '',
      },
      {
        id: '1d3a1c6e-707e-44dc-a1d2-30030bf1a944',
        name: 'Netflix',
        domainName: 'netflix.com',
        address: '',
      },
      {
        id: '7a93d1e5-3f74-492d-a101-2a70f50a1645',
        name: 'Libeo',
        domainName: 'libeo.io',
        address: '',
      },
      {
        id: '9d162de6-cfbf-4156-a790-e39854dcd4eb',
        name: 'Claap',
        domainName: 'claap.io',
        address: '',
      },
      {
        id: 'aaffcfbd-f86b-419f-b794-02319abe8637',
        name: 'Hasura',
        domainName: 'hasura.io',
        address: '',
      },
      {
        id: 'f33dc242-5518-4553-9433-42d8eb82834b',
        name: 'Wework',
        domainName: 'wework.com',
        address: '',
      },
      {
        id: 'a7bc68d5-f79e-40dd-bd06-c36e6abb4678',
        name: 'Samsung',
        domainName: 'samsung.com',
        address: '',
      },
      {
        id: 'a674fa6c-1455-4c57-afaf-dd5dc086361d',
        name: 'Algolia',
        domainName: 'algolia.com',
        address: '',
      },
    ])
    .execute();
};
