import { normalizeEmailAddress } from 'src/engine/core-modules/record-transformer/utils/normalize-email-address.util';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const findPersonByPrimaryOrAdditionalEmail = ({
  people,
  email,
}: {
  people: PersonWorkspaceEntity[];
  email: string;
}): PersonWorkspaceEntity | undefined => {
  const normalizedEmail = normalizeEmailAddress(email);

  const personWithPrimaryEmail = people.find(
    (person) =>
      person.emails?.primaryEmail === normalizedEmail,
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
      (additionalEmail) => additionalEmail === normalizedEmail,
    );
  });

  return personWithAdditionalEmail;
};
