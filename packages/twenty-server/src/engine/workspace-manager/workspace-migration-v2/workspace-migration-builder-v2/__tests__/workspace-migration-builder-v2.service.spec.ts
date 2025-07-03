import { UpdateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';

describe('WorkspaceMigrationBuilderV2Service', () => {
  let service: WorkspaceMigrationBuilderV2Service;

  beforeEach(() => {
    service = new WorkspaceMigrationBuilderV2Service();
  });

  it('should return a migration when nameSingular changes', () => {
    const from: WorkspaceMigrationObjectInput = {
      uniqueIdentifier: '123e4567-e89b-12d3-a456-426614175000',
      nameSingular: 'Contact',
      namePlural: 'Contacts',
      labelSingular: 'Contact',
      labelPlural: 'Contacts',
      description: 'A contact',
      fields: [
        {
          uniqueIdentifier: '123e4567-e89b-12d3-a456-426614174000',
          name: 'firstName',
          label: 'First Name',
          type: 'string',
        },
      ],
    };
    const to: WorkspaceMigrationObjectInput = {
      ...from,
      nameSingular: 'Person',
    };
    const result = service.build({ from, to });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].actions.length).toBeGreaterThan(0);
    expect(result[0].actions[0].type).toBe('update_object');
        expect(
      (result[0].actions[0] as UpdateObjectAction).object.from,
    ).toBe('Contact');
    expect(
      (result[0].actions[0] as UpdateObjectAction).object.to,
    ).toBe('Person');
  });
});
