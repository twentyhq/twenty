import { FieldMetadataType } from 'twenty-shared/types';

import { FlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';

describe('WorkspaceMigrationBuilderV2Service', () => {
  let service: WorkspaceMigrationBuilderV2Service;

  const baseObject: FlatObjectMetadata = {
    uniqueIdentifier: '20202020-e89b-12d3-a456-426614175000',
    nameSingular: 'Contact',
    namePlural: 'Contacts',
    labelSingular: 'Contact',
    flatIndexMetadatas: [],
    labelPlural: 'Contacts',
    description: 'A contact',
    flatFieldMetadatas: [
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
    const from: FlatObjectMetadata = baseObject;
    const to: FlatObjectMetadata = {
      ...from,
      nameSingular: 'Person',
    };
    const result = service.build({ from: [from], to: [to] });

    expect(result).toMatchInlineSnapshot(`
{
  "actions": [
    {
      "flatObjectMetadata": {
        "description": "A contact",
        "flatFieldMetadatas": [
          {
            "defaultValue": "",
            "description": "",
            "label": "First Name",
            "name": "firstName",
            "type": "FULL_NAME",
            "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174000",
          },
        ],
        "flatIndexMetadatas": [],
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
    const newObject: FlatObjectMetadata = {
      uniqueIdentifier: '20202020-e89b-12d3-a456-426614175001',
      nameSingular: 'Company',
      namePlural: 'Companies',
      flatIndexMetadatas: [],
      labelSingular: 'Company',
      labelPlural: 'Companies',
      description: 'A company',
      flatFieldMetadatas: [
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
      "flatObjectMetadata": {
        "description": "A company",
        "flatFieldMetadatas": [
          {
            "defaultValue": "",
            "description": "",
            "label": "Name",
            "name": "name",
            "type": "ADDRESS",
            "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174001",
          },
        ],
        "flatIndexMetadatas": [],
        "labelPlural": "Companies",
        "labelSingular": "Company",
        "namePlural": "Companies",
        "nameSingular": "Company",
        "uniqueIdentifier": "20202020-e89b-12d3-a456-426614175001",
      },
      "type": "create_object",
    },
    {
      "flatFieldMetadata": {
        "defaultValue": "",
        "description": "",
        "label": "Name",
        "name": "name",
        "type": "ADDRESS",
        "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174001",
      },
      "flatObjectMetadata": {
        "description": "A company",
        "flatFieldMetadatas": [
          {
            "defaultValue": "",
            "description": "",
            "label": "Name",
            "name": "name",
            "type": "ADDRESS",
            "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174001",
          },
        ],
        "flatIndexMetadatas": [],
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
      "flatObjectMetadata": {
        "description": "A contact",
        "flatFieldMetadatas": [
          {
            "defaultValue": "",
            "description": "",
            "label": "First Name",
            "name": "firstName",
            "type": "FULL_NAME",
            "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174000",
          },
        ],
        "flatIndexMetadatas": [],
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
    const objectToUpdate: FlatObjectMetadata = {
      ...baseObject,
      nameSingular: 'Person',
      flatFieldMetadatas: [
        ...baseObject.flatFieldMetadatas,
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
    const objectToCreate: FlatObjectMetadata = {
      uniqueIdentifier: '20202020-1218-4fc0-b32d-fc4f005c4bab',
      nameSingular: 'Company',
      namePlural: 'Companies',
      flatIndexMetadatas: [],
      labelSingular: 'Company',
      labelPlural: 'Companies',
      description: 'A company',
      flatFieldMetadatas: [
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
      "flatObjectMetadata": {
        "description": "A company",
        "flatFieldMetadatas": [
          {
            "defaultValue": "",
            "description": "",
            "label": "Name",
            "name": "name",
            "type": "ADDRESS",
            "uniqueIdentifier": "20202020-1016-4f09-bad6-e75681f385f4",
          },
        ],
        "flatIndexMetadatas": [],
        "labelPlural": "Companies",
        "labelSingular": "Company",
        "namePlural": "Companies",
        "nameSingular": "Company",
        "uniqueIdentifier": "20202020-1218-4fc0-b32d-fc4f005c4bab",
      },
      "type": "create_object",
    },
    {
      "flatObjectMetadata": {
        "description": "A contact",
        "flatFieldMetadatas": [
          {
            "defaultValue": "",
            "description": "",
            "label": "First Name",
            "name": "firstName",
            "type": "FULL_NAME",
            "uniqueIdentifier": "20202020-e89b-12d3-a456-426614174000",
          },
        ],
        "flatIndexMetadatas": [],
        "labelPlural": "Contacts",
        "labelSingular": "Contact",
        "namePlural": "Contacts",
        "nameSingular": "Contact",
        "uniqueIdentifier": "20202020-59ef-4a14-a509-0a02acb248d5",
      },
      "type": "delete_object",
    },
    {
      "flatObjectMetadata": {
        "description": "A contact",
        "flatFieldMetadatas": [
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
        "flatIndexMetadatas": [],
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
      "flatFieldMetadata": {
        "defaultValue": "",
        "description": "",
        "label": "Name",
        "name": "name",
        "type": "ADDRESS",
        "uniqueIdentifier": "20202020-1016-4f09-bad6-e75681f385f4",
      },
      "flatObjectMetadata": {
        "description": "A company",
        "flatFieldMetadatas": [
          {
            "defaultValue": "",
            "description": "",
            "label": "Name",
            "name": "name",
            "type": "ADDRESS",
            "uniqueIdentifier": "20202020-1016-4f09-bad6-e75681f385f4",
          },
        ],
        "flatIndexMetadatas": [],
        "labelPlural": "Companies",
        "labelSingular": "Company",
        "namePlural": "Companies",
        "nameSingular": "Company",
        "uniqueIdentifier": "20202020-1218-4fc0-b32d-fc4f005c4bab",
      },
      "type": "create_field",
    },
    {
      "flatFieldMetadata": {
        "defaultValue": "",
        "description": "new field description",
        "label": "New field",
        "name": "newField",
        "type": "NUMBER",
        "uniqueIdentifier": "20202020-3ad3-4fec-9c46-8dc9158980e3",
      },
      "flatObjectMetadata": {
        "description": "A contact",
        "flatFieldMetadatas": [
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
        "flatIndexMetadatas": [],
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
    const objectA: FlatObjectMetadata = {
      uniqueIdentifier: 'id-1',
      flatIndexMetadatas: [],
      nameSingular: 'Duplicate',
      namePlural: 'Duplicates',
      labelSingular: 'Duplicate',
      labelPlural: 'Duplicates',
      description: 'First object',
      flatFieldMetadatas: [
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
    const objectB: FlatObjectMetadata = {
      uniqueIdentifier: 'id-2',
      nameSingular: 'Duplicate',
      namePlural: 'Duplicates',
      labelSingular: 'Duplicate',
      labelPlural: 'Duplicates',
      flatIndexMetadatas: [],
      description: 'Second object',
      flatFieldMetadatas: [
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
    "flatObjectMetadata": {
      "description": "First object",
      "flatFieldMetadatas": [
        {
          "defaultValue": "",
          "description": "",
          "label": "Field A",
          "name": "fieldA",
          "type": "FULL_NAME",
          "uniqueIdentifier": "field-1",
        },
      ],
      "flatIndexMetadatas": [],
      "labelPlural": "Duplicates",
      "labelSingular": "Duplicate",
      "namePlural": "Duplicates",
      "nameSingular": "Duplicate",
      "uniqueIdentifier": "id-1",
    },
    "type": "create_object",
  },
  {
    "flatObjectMetadata": {
      "description": "Second object",
      "flatFieldMetadatas": [
        {
          "defaultValue": "",
          "description": "",
          "label": "Field B",
          "name": "fieldB",
          "type": "ADDRESS",
          "uniqueIdentifier": "field-2",
        },
      ],
      "flatIndexMetadatas": [],
      "labelPlural": "Duplicates",
      "labelSingular": "Duplicate",
      "namePlural": "Duplicates",
      "nameSingular": "Duplicate",
      "uniqueIdentifier": "id-2",
    },
    "type": "create_object",
  },
  {
    "flatFieldMetadata": {
      "defaultValue": "",
      "description": "",
      "label": "Field A",
      "name": "fieldA",
      "type": "FULL_NAME",
      "uniqueIdentifier": "field-1",
    },
    "flatObjectMetadata": {
      "description": "First object",
      "flatFieldMetadatas": [
        {
          "defaultValue": "",
          "description": "",
          "label": "Field A",
          "name": "fieldA",
          "type": "FULL_NAME",
          "uniqueIdentifier": "field-1",
        },
      ],
      "flatIndexMetadatas": [],
      "labelPlural": "Duplicates",
      "labelSingular": "Duplicate",
      "namePlural": "Duplicates",
      "nameSingular": "Duplicate",
      "uniqueIdentifier": "id-1",
    },
    "type": "create_field",
  },
  {
    "flatFieldMetadata": {
      "defaultValue": "",
      "description": "",
      "label": "Field B",
      "name": "fieldB",
      "type": "ADDRESS",
      "uniqueIdentifier": "field-2",
    },
    "flatObjectMetadata": {
      "description": "Second object",
      "flatFieldMetadatas": [
        {
          "defaultValue": "",
          "description": "",
          "label": "Field B",
          "name": "fieldB",
          "type": "ADDRESS",
          "uniqueIdentifier": "field-2",
        },
      ],
      "flatIndexMetadatas": [],
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
    "flatObjectMetadata": {
      "description": "First object",
      "flatFieldMetadatas": [
        {
          "defaultValue": "",
          "description": "",
          "label": "Field A",
          "name": "fieldA",
          "type": "FULL_NAME",
          "uniqueIdentifier": "field-1",
        },
      ],
      "flatIndexMetadatas": [],
      "labelPlural": "Duplicates",
      "labelSingular": "Duplicate",
      "namePlural": "Duplicates",
      "nameSingular": "Duplicate",
      "uniqueIdentifier": "id-1",
    },
    "type": "delete_object",
  },
  {
    "flatObjectMetadata": {
      "description": "Second object",
      "flatFieldMetadatas": [
        {
          "defaultValue": "",
          "description": "",
          "label": "Field B",
          "name": "fieldB",
          "type": "ADDRESS",
          "uniqueIdentifier": "field-2",
        },
      ],
      "flatIndexMetadatas": [],
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
    const obj: FlatObjectMetadata = { ...baseObject };
    const result = service.build({ from: [obj], to: [obj] });

    expect(result.actions).toEqual([]);
  });
});
