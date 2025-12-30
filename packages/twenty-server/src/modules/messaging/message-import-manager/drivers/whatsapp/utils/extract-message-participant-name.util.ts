import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const extractParticipantName = (
  person: PersonWorkspaceEntity | null,
) => {
  return person !== null
    ? `${person.name?.firstName} ${person.name?.lastName}`
    : null;
};
