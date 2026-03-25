import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const findPersonByPrimaryOrAdditionalEmail = ({
  people,
  email,
}: {
  people: PersonWorkspaceEntity[];
  email: string;
}): PersonWorkspaceEntity | undefined => {
  const lowercaseEmail = email.toLowerCase();

  const personWithPrimaryEmail = people.find(
    (person) => person.emails?.primaryEmail?.toLowerCase() === lowercaseEmail,
  );

  if (personWithPrimaryEmail) {
    return personWithPrimaryEmail;
  }

  const personWithAdditionalEmail = people.find((person) => {
    const additionalEmails = person.emails?.additionalEmails;

    if (!Array.isArray(additionalEmails)) {
      return false;
    }

    return additionalEmails.some(
      (additionalEmail) => additionalEmail.toLowerCase() === lowercaseEmail,
    );
  });

  return personWithAdditionalEmail;
};
