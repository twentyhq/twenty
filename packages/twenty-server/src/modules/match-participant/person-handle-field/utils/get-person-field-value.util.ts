import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

// the declared field can be one an app added, which the standard entity type does not list
export const getPersonFieldValue = ({
  person,
  fieldName,
}: {
  person: PersonWorkspaceEntity;
  fieldName: string;
}): unknown => (person as unknown as Record<string, unknown>)[fieldName];
