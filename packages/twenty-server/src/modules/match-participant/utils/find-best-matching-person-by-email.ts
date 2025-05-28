import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const findBestMatchingPersonByEmail = (
  people: PersonWorkspaceEntity[],
  email: string,
): PersonWorkspaceEntity | undefined => {
  const personWithPrimaryEmail = people.find(
    (person) => person.emails?.primaryEmail === email,
  );

  if (personWithPrimaryEmail) {
    return personWithPrimaryEmail;
  }

  return people.find(
    (person) =>
      Array.isArray(person.emails?.additionalEmails) &&
      person.emails.additionalEmails.includes(email),
  );
};
