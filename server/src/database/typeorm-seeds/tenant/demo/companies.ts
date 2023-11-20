import fs from 'fs';
import path from 'path';

import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

const tableName = 'company';

export const seedCompanies = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  const data = fs.readFileSync(
    path.resolve(__dirname, 'companies-demo.json'),
    'utf8',
  );
  const companies = JSON.parse(data);

  // Iterate through the array and add a UUID for each company
  const companiesWithId = companies.map((company) => ({
    id: uuidv4(),
    ...company,
  }));

  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'name',
      'domainName',
      'address',
      'employees',
      'linkedinLinkUrl',
    ])
    .orIgnore()
    .values(companiesWithId)
    .execute();
};
