import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';

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
        type: FieldMetadataType.FULL_NAME,
        defaultValue: '',
        description: '',
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
      "objectMetadataUniqueIdentifier": "123e4567-e89b-12d3-a456-426614175000",
      "type": "update_object",
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
          type: FieldMetadataType.ADDRESS,
          defaultValue: '',
          description: '',
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
            "defaultValue": "",
            "description": "",
            "label": "Name",
            "name": "name",
            "type": "ADDRESS",
            "uniqueIdentifier": "123e4567-e89b-12d3-a456-426614174001",
          },
        ],
        "labelPlural": "Companies",
        "labelSingular": "Company",
        "namePlural": "Companies",
        "nameSingular": "Company",
        "uniqueIdentifier": "123e4567-e89b-12d3-a456-426614175001",
      },
      "objectMetadataUniqueIdentifier": "123e4567-e89b-12d3-a456-426614175001",
      "type": "create_object",
    },
    {
      "field": {
        "defaultValue": "",
        "description": "",
        "label": "Name",
        "name": "name",
        "type": "ADDRESS",
        "uniqueIdentifier": "123e4567-e89b-12d3-a456-426614174001",
      },
      "fieldMetadataUniqueIdentifier": "123e4567-e89b-12d3-a456-426614174001",
      "objectMetadataUniqueIdentifier": "123e4567-e89b-12d3-a456-426614175001",
      "type": "create_field",
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
      "objectMetadataUniqueIdentifier": "123e4567-e89b-12d3-a456-426614175000",
      "type": "delete_object",
    },
  ],
}
`);
  });

  it('should handle multiple operations in a single migration', () => {
    const objectToUpdate: WorkspaceMigrationObjectInput = {
      ...baseObject,
      nameSingular: 'Person',
      fields: [
        ...baseObject.fields,
        {
          defaultValue: '',
          label: 'New field',
          type: FieldMetadataType.NUMBER,
          name: 'newField',
          uniqueIdentifier: '20202020-3ad3-4fec-9c46-8dc9158980e3',
          description: 'new field description',
        },
      ],
    };
    const objectToDelete = {
      ...baseObject,
      uniqueIdentifier: '20202020-59ef-4a14-a509-0a02acb248d5',
    };
    const objectToCreate: WorkspaceMigrationObjectInput = {
      uniqueIdentifier: '20202020-1218-4fc0-b32d-fc4f005c4bab',
      nameSingular: 'Company',
      namePlural: 'Companies',
      labelSingular: 'Company',
      labelPlural: 'Companies',
      description: 'A company',
      fields: [
        {
          uniqueIdentifier: '20202020-1016-4f09-bad6-e75681f385f4',
          name: 'name',
          label: 'Name',
          type: FieldMetadataType.ADDRESS,
          defaultValue: '',
          description: '',
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
            "defaultValue": "",
            "description": "",
            "label": "Name",
            "name": "name",
            "type": "ADDRESS",
            "uniqueIdentifier": "20202020-1016-4f09-bad6-e75681f385f4",
          },
        ],
        "labelPlural": "Companies",
        "labelSingular": "Company",
        "namePlural": "Companies",
        "nameSingular": "Company",
        "uniqueIdentifier": "20202020-1218-4fc0-b32d-fc4f005c4bab",
      },
      "objectMetadataUniqueIdentifier": "20202020-1218-4fc0-b32d-fc4f005c4bab",
      "type": "create_object",
    },
    {
      "field": {
        "defaultValue": "",
        "description": "",
        "label": "Name",
        "name": "name",
        "type": "ADDRESS",
        "uniqueIdentifier": "20202020-1016-4f09-bad6-e75681f385f4",
      },
      "fieldMetadataUniqueIdentifier": "20202020-1016-4f09-bad6-e75681f385f4",
      "objectMetadataUniqueIdentifier": "20202020-1218-4fc0-b32d-fc4f005c4bab",
      "type": "create_field",
    },
    {
      "objectMetadataUniqueIdentifier": "20202020-59ef-4a14-a509-0a02acb248d5",
      "type": "delete_object",
    },
    {
      "objectMetadataUniqueIdentifier": "123e4567-e89b-12d3-a456-426614175000",
      "type": "update_object",
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
