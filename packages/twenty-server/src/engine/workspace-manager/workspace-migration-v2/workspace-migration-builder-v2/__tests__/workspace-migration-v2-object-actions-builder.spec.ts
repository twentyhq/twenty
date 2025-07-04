import { WorkspaceMigrationObjectInput } from "src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input";
import { WorkspaceMigrationBuilderV2Service } from "src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service";

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
    const from: WorkspaceMigrationObjectInput = baseObject;
    const to: WorkspaceMigrationObjectInput = {
      ...from,
      nameSingular: 'Person',
    };
    const result = service.build({ from: [from], to: [to] });

    expect(result).toMatchInlineSnapshot(`
{
  "actions": [
    {
      "type": "update_object",
      "uniqueIdentifier": "123e4567-e89b-12d3-a456-426614175000",
      "updates": [
        {
          "from": "Contact",
          "property": "nameSingular",
          "to": "Person",
        },
      ],
    },
  ],
}
`);
  });

  it('should return a migration when creating a new object', () => {
    const newObject: WorkspaceMigrationObjectInput = {
      uniqueIdentifier: '123e4567-e89b-12d3-a456-426614175001',
      nameSingular: 'Company',
      namePlural: 'Companies',
      labelSingular: 'Company',
      labelPlural: 'Companies',
      description: 'A company',
      fields: [
        {
          uniqueIdentifier: '123e4567-e89b-12d3-a456-426614174001',
          name: 'name',
          label: 'Name',
          type: 'string',
        },
      ],
    };

    const result = service.build({ from: [], to: [newObject] });

    expect(result).toMatchInlineSnapshot(`
{
  "actions": [
    {
      "object": {
        "description": "A company",
        "fields": [
          {
            "label": "Name",
            "name": "name",
            "type": "string",
            "uniqueIdentifier": "123e4567-e89b-12d3-a456-426614174001",
          },
        ],
        "labelPlural": "Companies",
        "labelSingular": "Company",
        "namePlural": "Companies",
        "nameSingular": "Company",
        "uniqueIdentifier": "123e4567-e89b-12d3-a456-426614175001",
      },
      "type": "create_object",
      "uniqueIdentifier": "123e4567-e89b-12d3-a456-426614175001",
    },
  ],
}
`);
  });

  it('should return a migration when deleting an object', () => {
    const result = service.build({ from: [baseObject], to: [] });

    expect(result).toMatchInlineSnapshot(`
{
  "actions": [
    {
      "objectMetadataId": "123e4567-e89b-12d3-a456-426614175000",
      "type": "delete_object",
      "uniqueIdentifier": "123e4567-e89b-12d3-a456-426614175000",
    },
  ],
}
`);
  });

  it('should handle multiple operations in a single migration', () => {
    const objectToUpdate = { ...baseObject, nameSingular: 'Person' };
    const objectToDelete = {
      ...baseObject,
      uniqueIdentifier: '123e4567-e89b-12d3-a456-426614175002',
    };
    const objectToCreate: WorkspaceMigrationObjectInput = {
      uniqueIdentifier: '123e4567-e89b-12d3-a456-426614175003',
      nameSingular: 'Company',
      namePlural: 'Companies',
      labelSingular: 'Company',
      labelPlural: 'Companies',
      description: 'A company',
      fields: [
        {
          uniqueIdentifier: '123e4567-e89b-12d3-a456-426614174003',
          name: 'name',
          label: 'Name',
          type: 'string',
        },
      ],
    };

    const result = service.build({
      from: [baseObject, objectToDelete],
      to: [objectToUpdate, objectToCreate],
    });

    expect(result).toMatchInlineSnapshot(`
{
  "actions": [
    {
      "object": {
        "description": "A company",
        "fields": [
          {
            "label": "Name",
            "name": "name",
            "type": "string",
            "uniqueIdentifier": "123e4567-e89b-12d3-a456-426614174003",
          },
        ],
        "labelPlural": "Companies",
        "labelSingular": "Company",
        "namePlural": "Companies",
        "nameSingular": "Company",
        "uniqueIdentifier": "123e4567-e89b-12d3-a456-426614175003",
      },
      "type": "create_object",
      "uniqueIdentifier": "123e4567-e89b-12d3-a456-426614175003",
    },
    {
      "objectMetadataId": "123e4567-e89b-12d3-a456-426614175002",
      "type": "delete_object",
      "uniqueIdentifier": "123e4567-e89b-12d3-a456-426614175002",
    },
    {
      "type": "update_object",
      "uniqueIdentifier": "123e4567-e89b-12d3-a456-426614175000",
      "updates": [
        {
          "from": "Contact",
          "property": "nameSingular",
          "to": "Person",
        },
      ],
    },
  ],
}
`);
  });
});
