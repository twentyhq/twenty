import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const computeChangedAdditionalEmails = (
  diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>>,
) => {
  const before = diff.emails?.before.additionalEmails as string[];
  const after = diff.emails?.after.additionalEmails as string[];

  if (!Array.isArray(before) || !Array.isArray(after)) {
    return {
      addedAdditionalEmails: [],
      removedAdditionalEmails: [],
    };
  }

  const addedAdditionalEmails = after.filter(
    (email) => !before.includes(email),
  );
  const removedAdditionalEmails = before.filter(
    (email) => !after.includes(email),
  );

  return {
    addedAdditionalEmails,
    removedAdditionalEmails,
  };
};
