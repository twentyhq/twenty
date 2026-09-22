import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { getEmailIdentityKey } from 'twenty-shared/utils';

export const findPersonByPrimaryOrAdditionalEmail = ({
  people,
  email,
}: {
  people: PersonWorkspaceEntity[];
  email: string;
}): PersonWorkspaceEntity | undefined => {
  const canonicalEmail = getEmailIdentityKey(email);

  const personWithPrimaryEmail = people.find(
    (person) =>
      person.emails?.primaryEmail &&
      getEmailIdentityKey(person.emails.primaryEmail) === canonicalEmail,
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
        getEmailIdentityKey(additionalEmail) === canonicalEmail,
    );
  });

  return personWithAdditionalEmail;
};
