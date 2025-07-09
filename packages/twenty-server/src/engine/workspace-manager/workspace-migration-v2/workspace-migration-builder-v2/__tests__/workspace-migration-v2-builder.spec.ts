import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';

describe('WorkspaceMigrationBuilderV2Service', () => {
  let service: WorkspaceMigrationBuilderV2Service;

  const baseObject: WorkspaceMigrationObjectInput = {
    uniqueIdentifier: '20202020-e89b-12d3-a456-426614175000',
    nameSingular: 'Contact',
    namePlural: 'Contacts',
    labelSingular: 'Contact',
    labelPlural: 'Contacts',
    description: 'A contact',
    fieldInputs: [
      {
        uniqueIdentifier: '20202020-e89b-12d3-a456-426614174000',
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
      "objectMetadataInput": {
        "description": "A contact",
        "fieldInputs": [
          {
            "defaultValue": "",
            "description": "",
            "label": "First Name",
            "name": "firstName",
            "type": "FULL_NAME",
            "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174000",
          },
        ],
        "labelPlural": "Contacts",
        "labelSingular": "Contact",
        "namePlural": "Contacts",
        "nameSingular": "Person",
        "uniqueIdentifier": "20202020-e89b-12d3-a456-426614175000",
      },
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
      uniqueIdentifier: '20202020-e89b-12d3-a456-426614175001',
      nameSingular: 'Company',
      namePlural: 'Companies',
      labelSingular: 'Company',
      labelPlural: 'Companies',
      description: 'A company',
      fieldInputs: [
        {
          uniqueIdentifier: '20202020-e89b-12d3-a456-426614174001',
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
      "objectMetadataInput": {
        "description": "A company",
        "fieldInputs": [
          {
            "defaultValue": "",
            "description": "",
            "label": "Name",
            "name": "name",
            "type": "ADDRESS",
            "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174001",
          },
        ],
        "labelPlural": "Companies",
        "labelSingular": "Company",
        "namePlural": "Companies",
        "nameSingular": "Company",
        "uniqueIdentifier": "20202020-e89b-12d3-a456-426614175001",
      },
      "type": "create_object",
    },
    {
      "fieldMetadataInput": {
        "defaultValue": "",
        "description": "",
        "label": "Name",
        "name": "name",
        "type": "ADDRESS",
        "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174001",
      },
      "objectMetadataInput": {
        "description": "A company",
        "fieldInputs": [
          {
            "defaultValue": "",
            "description": "",
            "label": "Name",
            "name": "name",
            "type": "ADDRESS",
            "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174001",
          },
        ],
        "labelPlural": "Companies",
        "labelSingular": "Company",
        "namePlural": "Companies",
        "nameSingular": "Company",
        "uniqueIdentifier": "20202020-e89b-12d3-a456-426614175001",
      },
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
      "objectMetadataInput": {
        "description": "A contact",
        "fieldInputs": [
          {
            "defaultValue": "",
            "description": "",
            "label": "First Name",
            "name": "firstName",
            "type": "FULL_NAME",
            "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174000",
          },
        ],
        "labelPlural": "Contacts",
        "labelSingular": "Contact",
        "namePlural": "Contacts",
        "nameSingular": "Contact",
        "uniqueIdentifier": "20202020-e89b-12d3-a456-426614175000",
      },
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
      fieldInputs: [
        ...baseObject.fieldInputs,
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
      fieldInputs: [
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
      "objectMetadataInput": {
        "description": "A company",
        "fieldInputs": [
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
      "type": "create_object",
    },
    {
      "objectMetadataInput": {
        "description": "A contact",
        "fieldInputs": [
          {
            "defaultValue": "",
            "description": "",
            "label": "First Name",
            "name": "firstName",
            "type": "FULL_NAME",
            "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174000",
          },
        ],
        "labelPlural": "Contacts",
        "labelSingular": "Contact",
        "namePlural": "Contacts",
        "nameSingular": "Contact",
        "uniqueIdentifier": "20202020-59ef-4a14-a509-0a02acb248d5",
      },
      "type": "delete_object",
    },
    {
      "objectMetadataInput": {
        "description": "A contact",
        "fieldInputs": [
          {
            "defaultValue": "",
            "description": "",
            "label": "First Name",
            "name": "firstName",
            "type": "FULL_NAME",
            "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174000",
          },
          {
            "defaultValue": "",
            "description": "new field description",
            "label": "New field",
            "name": "newField",
            "type": "NUMBER",
            "uniqueIdentifier": "20202020-3ad3-4fec-9c46-8dc9158980e3",
          },
        ],
        "labelPlural": "Contacts",
        "labelSingular": "Contact",
        "namePlural": "Contacts",
        "nameSingular": "Person",
        "uniqueIdentifier": "20202020-e89b-12d3-a456-426614175000",
      },
      "type": "update_object",
      "updates": [
        {
          "from": "Contact",
          "property": "nameSingular",
          "to": "Person",
        },
      ],
    },
    {
      "fieldMetadataInput": {
        "defaultValue": "",
        "description": "",
        "label": "Name",
        "name": "name",
        "type": "ADDRESS",
        "uniqueIdentifier": "20202020-1016-4f09-bad6-e75681f385f4",
      },
      "objectMetadataInput": {
        "description": "A company",
        "fieldInputs": [
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
      "type": "create_field",
    },
    {
      "fieldMetadataInput": {
        "defaultValue": "",
        "description": "new field description",
        "label": "New field",
        "name": "newField",
        "type": "NUMBER",
        "uniqueIdentifier": "20202020-3ad3-4fec-9c46-8dc9158980e3",
      },
      "objectMetadataInput": {
        "description": "A contact",
        "fieldInputs": [
          {
            "defaultValue": "",
            "description": "",
            "label": "First Name",
            "name": "firstName",
            "type": "FULL_NAME",
            "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174000",
          },
          {
            "defaultValue": "",
            "description": "new field description",
            "label": "New field",
            "name": "newField",
            "type": "NUMBER",
            "uniqueIdentifier": "20202020-3ad3-4fec-9c46-8dc9158980e3",
          },
        ],
        "labelPlural": "Contacts",
        "labelSingular": "Contact",
        "namePlural": "Contacts",
        "nameSingular": "Person",
        "uniqueIdentifier": "20202020-e89b-12d3-a456-426614175000",
      },
      "type": "create_field",
    },
  ],
}
`);
  });

  it('should treat objects with the same name but different IDs as distinct', () => {
    const objectA: WorkspaceMigrationObjectInput = {
      uniqueIdentifier: 'id-1',
      nameSingular: 'Duplicate',
      namePlural: 'Duplicates',
      labelSingular: 'Duplicate',
      labelPlural: 'Duplicates',
      description: 'First object',
      fieldInputs: [
        {
          uniqueIdentifier: 'field-1',
          name: 'fieldA',
          label: 'Field A',
          type: FieldMetadataType.FULL_NAME,
          defaultValue: '',
          description: '',
        },
      ],
    };
    const objectB: WorkspaceMigrationObjectInput = {
      uniqueIdentifier: 'id-2',
      nameSingular: 'Duplicate',
      namePlural: 'Duplicates',
      labelSingular: 'Duplicate',
      labelPlural: 'Duplicates',
      description: 'Second object',
      fieldInputs: [
        {
          uniqueIdentifier: 'field-2',
          name: 'fieldB',
          label: 'Field B',
          type: FieldMetadataType.ADDRESS,
          defaultValue: '',
          description: '',
        },
      ],
    };

    const result = service.build({ from: [], to: [objectA, objectB] });

    expect(result.actions).toMatchInlineSnapshot(`
[
  {
    "objectMetadataInput": {
      "description": "First object",
      "fieldInputs": [
        {
          "defaultValue": "",
          "description": "",
          "label": "Field A",
          "name": "fieldA",
          "type": "FULL_NAME",
          "uniqueIdentifier": "field-1",
        },
      ],
      "labelPlural": "Duplicates",
      "labelSingular": "Duplicate",
      "namePlural": "Duplicates",
      "nameSingular": "Duplicate",
      "uniqueIdentifier": "id-1",
    },
    "type": "create_object",
  },
  {
    "objectMetadataInput": {
      "description": "Second object",
      "fieldInputs": [
        {
          "defaultValue": "",
          "description": "",
          "label": "Field B",
          "name": "fieldB",
          "type": "ADDRESS",
          "uniqueIdentifier": "field-2",
        },
      ],
      "labelPlural": "Duplicates",
      "labelSingular": "Duplicate",
      "namePlural": "Duplicates",
      "nameSingular": "Duplicate",
      "uniqueIdentifier": "id-2",
    },
    "type": "create_object",
  },
  {
    "fieldMetadataInput": {
      "defaultValue": "",
      "description": "",
      "label": "Field A",
      "name": "fieldA",
      "type": "FULL_NAME",
      "uniqueIdentifier": "field-1",
    },
    "objectMetadataInput": {
      "description": "First object",
      "fieldInputs": [
        {
          "defaultValue": "",
          "description": "",
          "label": "Field A",
          "name": "fieldA",
          "type": "FULL_NAME",
          "uniqueIdentifier": "field-1",
        },
      ],
      "labelPlural": "Duplicates",
      "labelSingular": "Duplicate",
      "namePlural": "Duplicates",
      "nameSingular": "Duplicate",
      "uniqueIdentifier": "id-1",
    },
    "type": "create_field",
  },
  {
    "fieldMetadataInput": {
      "defaultValue": "",
      "description": "",
      "label": "Field B",
      "name": "fieldB",
      "type": "ADDRESS",
      "uniqueIdentifier": "field-2",
    },
    "objectMetadataInput": {
      "description": "Second object",
      "fieldInputs": [
        {
          "defaultValue": "",
          "description": "",
          "label": "Field B",
          "name": "fieldB",
          "type": "ADDRESS",
          "uniqueIdentifier": "field-2",
        },
      ],
      "labelPlural": "Duplicates",
      "labelSingular": "Duplicate",
      "namePlural": "Duplicates",
      "nameSingular": "Duplicate",
      "uniqueIdentifier": "id-2",
    },
    "type": "create_field",
  },
]
`);

    const deleteResult = service.build({ from: [objectA, objectB], to: [] });

    expect(deleteResult.actions).toMatchInlineSnapshot(`
[
  {
    "objectMetadataInput": {
      "description": "First object",
      "fieldInputs": [
        {
          "defaultValue": "",
          "description": "",
          "label": "Field A",
          "name": "fieldA",
          "type": "FULL_NAME",
          "uniqueIdentifier": "field-1",
        },
      ],
      "labelPlural": "Duplicates",
      "labelSingular": "Duplicate",
      "namePlural": "Duplicates",
      "nameSingular": "Duplicate",
      "uniqueIdentifier": "id-1",
    },
    "type": "delete_object",
  },
  {
    "objectMetadataInput": {
      "description": "Second object",
      "fieldInputs": [
        {
          "defaultValue": "",
          "description": "",
          "label": "Field B",
          "name": "fieldB",
          "type": "ADDRESS",
          "uniqueIdentifier": "field-2",
        },
      ],
      "labelPlural": "Duplicates",
      "labelSingular": "Duplicate",
      "namePlural": "Duplicates",
      "nameSingular": "Duplicate",
      "uniqueIdentifier": "id-2",
    },
    "type": "delete_object",
  },
]
`);
  });

  it('should emit no actions when from and to are deeply equal', () => {
    const obj: WorkspaceMigrationObjectInput = { ...baseObject };
    const result = service.build({ from: [obj], to: [obj] });

    expect(result.actions).toEqual([]);
  });
});
