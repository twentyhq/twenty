import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { compareTwoWorkspaceMigrationFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-field-actions-builder';

describe('WorkspaceMigrationBuilderV2Service', () => {
  let service: WorkspaceMigrationBuilderV2Service;

  const baseObject: WorkspaceMigrationObjectInput = {
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

  beforeEach(() => {
    service = new WorkspaceMigrationBuilderV2Service();
  });

  it('should return a migration when nameSingular changes', () => {
    const result = compareTwoWorkspaceMigrationFieldInput({
      from: { name: 'toto' },
      to: { name: 'titi' },
    });

    expect(result).toMatchInlineSnapshot(`
[
  {
    "oldValue": "toto",
    "path": [
      "name",
    ],
    "type": "CHANGE",
    "value": "titi",
  },
]
`);
  });
});
