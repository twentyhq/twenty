import { canonicalizeEmail } from 'twenty-shared/utils';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const findPersonByPrimaryOrAdditionalEmail = ({
  people,
  email,
}: {
  people: PersonWorkspaceEntity[];
  email: string;
}): PersonWorkspaceEntity | undefined => {
  const canonicalEmail = canonicalizeEmail(email);

  const personWithPrimaryEmail = people.find(
    (person) =>
      person.emails?.primaryEmail &&
      canonicalizeEmail(person.emails.primaryEmail) === canonicalEmail,
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
      (additionalEmail) =>
        canonicalizeEmail(additionalEmail) === canonicalEmail,
    );
  });

  return personWithAdditionalEmail;
};
