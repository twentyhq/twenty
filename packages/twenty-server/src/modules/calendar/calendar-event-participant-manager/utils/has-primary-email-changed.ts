import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const hasPrimaryEmailChanged = (
  diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>>,
) => {
  const before = diff.emails?.before?.primaryEmail?.toLowerCase();
  const after = diff.emails?.after?.primaryEmail?.toLowerCase();

  return before !== after;
};
