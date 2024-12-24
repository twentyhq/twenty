import { EntityManager } from 'typeorm';

import { peopleDemo } from 'src/engine/workspace-manager/demo-objects-prefill-data/people-demo.json';

export const seedPersonWithDemoData = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  const companies = await entityManager?.query(
    `SELECT * FROM ${schemaName}.company`,
  );

  // Iterate through the array and add a UUID for each person
  const people = peopleDemo.map((person, index) => ({
    nameFirstName: person.firstName,
    nameLastName: person.lastName,
    emailsPrimaryEmail: person.email,
    linkedinLinkPrimaryLinkUrl: person.linkedinUrl,
    jobTitle: person.jobTitle,
    city: person.city,
    avatarUrl: person.avatarUrl,
    companyId: companies[Math.floor(index / 2)].id,
    createdBySource: person.createdBySource,
    createdByWorkspaceMemberId: person.createdByWorkspaceMemberId,
    createdByName: person.createdByName,
    position: index
  }));

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.person`, [
      'nameFirstName',
      'nameLastName',
      'emailsPrimaryEmail',
      'linkedinLinkPrimaryLinkUrl',
      'jobTitle',
      'city',
      'avatarUrl',
      'companyId',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'position',
    ])
    .orIgnore()
    .values(people)
    .returning('*')
    .execute();
};
