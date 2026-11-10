import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const filterOutDeletedPeopleWithReusedPrimaryEmail = <
  TPerson extends Pick<PersonWorkspaceEntity, 'deletedAt' | 'emails'>,
>({
  people,
  primaryEmailsOfNonDeletedPeople,
}: {
  people: TPerson[];
  primaryEmailsOfNonDeletedPeople: string[];
}): TPerson[] => {
  const reusedPrimaryEmails = new Set(primaryEmailsOfNonDeletedPeople);

  return people.filter((person) => {
    const primaryEmail = person.emails?.primaryEmail;

    return (
      !isDefined(person.deletedAt) ||
      !isNonEmptyString(primaryEmail) ||
      !reusedPrimaryEmails.has(primaryEmail)
    );
  });
};
