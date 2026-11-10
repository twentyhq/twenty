import { isDefined } from 'twenty-shared/utils';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const sortPeopleWithNonDeletedFirst = (
  people: PersonWorkspaceEntity[],
): PersonWorkspaceEntity[] => [
  ...people.filter((person) => !isDefined(person.deletedAt)),
  ...people.filter((person) => isDefined(person.deletedAt)),
];
