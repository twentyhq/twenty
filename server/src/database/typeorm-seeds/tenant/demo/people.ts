import fs from 'fs';
import path from 'path';

import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

const tableName = 'person';

export const seedPeople = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  // Read the JSON file with people
  const data = fs.readFileSync(
    path.resolve(__dirname, 'people-demo.json'),
    'utf8',
  );
  const people = JSON.parse(data);

  const companies = await workspaceDataSource?.query(
    `SELECT * FROM ${schemaName}.company`,
  );

  // Iterate through the array and add a UUID for each person
  const peopleWithId = people.map((person, index) => ({
    id: uuidv4(),
    nameFirstName: person.firstName,
    nameLastName: person.lastName,
    email: person.email,
    linkedinLinkUrl: person.linkedinUrl,
    jobTitle: person.jobTitle,
    city: person.city,
    avatarUrl: person.avatarUrl,
    companyId: companies[Math.floor(index / 2)].id,
  }));

  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'nameFirstName',
      'nameLastName',
      'email',
      'linkedinLinkUrl',
      'jobTitle',
      'city',
      'avatarUrl',
      'companyId',
    ])
    .orIgnore()
    .values(peopleWithId)
    .execute();
};
