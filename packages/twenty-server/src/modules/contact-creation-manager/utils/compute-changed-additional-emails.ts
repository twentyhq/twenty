import { type ObjectRecordDiff } from 'twenty-shared/database-events';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const computeChangedAdditionalEmails = (
  diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>>,
) => {
  const before = diff.emails?.before?.additionalEmails as string[];
  const after = diff.emails?.after?.additionalEmails as string[];

  if (!Array.isArray(before) || !Array.isArray(after)) {
    return {
      addedAdditionalEmails: [],
      removedAdditionalEmails: [],
    };
  }

  const lowerCaseBefore = before.map((email) => email.toLowerCase());
  const lowerCaseAfter = after.map((email) => email.toLowerCase());

  const addedAdditionalEmails = lowerCaseAfter.filter(
    (email) => !lowerCaseBefore.includes(email),
  );
  const removedAdditionalEmails = lowerCaseBefore.filter(
    (email) => !lowerCaseAfter.includes(email),
  );

  return {
    addedAdditionalEmails,
    removedAdditionalEmails,
  };
};
