import { FieldMetadataType } from 'twenty-shared/types';

import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { FlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import { FlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-metadata';
import { FlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';

describe('Workspace migration builder indexes tests suite', () => {
  let service: WorkspaceMigrationBuilderV2Service;

  beforeEach(() => {
    service = new WorkspaceMigrationBuilderV2Service();
  });

  const createMockObject = (
    identifier: string,
    fields: Partial<FlatFieldMetadata>[] = [],
    indexes: FlatIndexMetadata[] = [],
  ): FlatObjectMetadata => ({
    uniqueIdentifier: identifier,
    flatIndexMetadatas: indexes,
    flatFieldMetadatas: fields.map((field) => ({
      type: FieldMetadataType.TEXT,
      name: 'defaultName',
      label: 'Default Label',
      isCustom: true,
      isActive: true,
      isNullable: true,
      uniqueIdentifier: 'default-id',
      ...field,
    })),
  });

  const createMockIndex = (
    name: string,
    fields: string[],
    isUnique = false,
  ): FlatIndexMetadata => ({
    name,
    isUnique,
    indexType: IndexType.BTREE,
    indexWhereClause: null,
    uniqueIdentifier: name,
    flatIndexFieldMetadatas: fields.map((field, index) => ({
      uniqueIdentifier: `${name}-field-${index}`,
      order: index,
    })),
  });

  describe('buildWorkspaceMigrationV2IndexActions', () => {
    it('should create index actions for created indexes', () => {
      const fromObjects: FlatObjectMetadata[] = [];
      const toObjects: FlatObjectMetadata[] = [
        createMockObject(
          'company',
          [
            {
              type: FieldMetadataType.TEXT,
              name: 'name',
              label: 'Name',
              uniqueIdentifier: 'name',
            },
          ],
          [createMockIndex('idx_company_name', ['name'], true)],
        ),
      ];

      const result = service.build({ from: fromObjects, to: toObjects });

      expect(result).toMatchInlineSnapshot(`
{
  "actions": [
    {
      "flatObjectMetadata": {
        "flatFieldMetadatas": [
          {
            "isActive": true,
            "isCustom": true,
            "isNullable": true,
            "label": "Name",
            "name": "name",
            "type": "TEXT",
            "uniqueIdentifier": "name",
          },
        ],
        "flatIndexMetadatas": [
          {
            "flatIndexFieldMetadatas": [
              {
                "order": 0,
                "uniqueIdentifier": "idx_company_name-field-0",
              },
            ],
            "indexType": "BTREE",
            "indexWhereClause": null,
            "isUnique": true,
            "name": "idx_company_name",
            "uniqueIdentifier": "idx_company_name",
          },
        ],
        "uniqueIdentifier": "company",
      },
      "type": "create_object",
    },
    {
      "flatFieldMetadata": {
        "isActive": true,
        "isCustom": true,
        "isNullable": true,
        "label": "Name",
        "name": "name",
        "type": "TEXT",
        "uniqueIdentifier": "name",
      },
      "flatObjectMetadata": {
        "flatFieldMetadatas": [
          {
            "isActive": true,
            "isCustom": true,
            "isNullable": true,
            "label": "Name",
            "name": "name",
            "type": "TEXT",
            "uniqueIdentifier": "name",
          },
        ],
        "flatIndexMetadatas": [
          {
            "flatIndexFieldMetadatas": [
              {
                "order": 0,
                "uniqueIdentifier": "idx_company_name-field-0",
              },
            ],
            "indexType": "BTREE",
            "indexWhereClause": null,
            "isUnique": true,
            "name": "idx_company_name",
            "uniqueIdentifier": "idx_company_name",
          },
        ],
        "uniqueIdentifier": "company",
      },
      "type": "create_field",
    },
    {
      "flatIndexMetadata": {
        "flatIndexFieldMetadatas": [
          {
            "order": 0,
            "uniqueIdentifier": "idx_company_name-field-0",
          },
        ],
        "indexType": "BTREE",
        "indexWhereClause": null,
        "isUnique": true,
        "name": "idx_company_name",
        "uniqueIdentifier": "idx_company_name",
      },
      "type": "create_index",
    },
  ],
}
`);
    });

    it('should create delete actions for deleted indexes', () => {
      const fromObjects: FlatObjectMetadata[] = [
        createMockObject(
          'company',
          [
            {
              type: FieldMetadataType.TEXT,
              name: 'name',
              label: 'Name',
              uniqueIdentifier: 'name',
            },
          ],
          [createMockIndex('idx_company_name', ['name'], true)],
        ),
      ];
      const toObjects: FlatObjectMetadata[] = [
        createMockObject('company', [
          {
            type: FieldMetadataType.TEXT,
            name: 'name',
            label: 'Name',
            uniqueIdentifier: 'name',
          },
        ]),
      ];

      const result = service.build({ from: fromObjects, to: toObjects });

      expect(result).toMatchInlineSnapshot(`
{
  "actions": [
    {
      "flatIndexMetadata": {
        "flatIndexFieldMetadatas": [
          {
            "order": 0,
            "uniqueIdentifier": "idx_company_name-field-0",
          },
        ],
        "indexType": "BTREE",
        "indexWhereClause": null,
        "isUnique": true,
        "name": "idx_company_name",
        "uniqueIdentifier": "idx_company_name",
      },
      "type": "delete_index",
    },
  ],
}
`);
    });

    it('should handle multiple index changes across different objects', () => {
      const fromObjects: FlatObjectMetadata[] = [
        createMockObject(
          'company',
          [
            {
              type: FieldMetadataType.TEXT,
              name: 'name',
              label: 'Name',
              uniqueIdentifier: 'name',
            },
          ],
          [createMockIndex('idx_company_name_old', ['name'], true)],
        ),
      ];
      const toObjects: FlatObjectMetadata[] = [
        createMockObject(
          'company',
          [
            {
              type: FieldMetadataType.TEXT,
              name: 'name',
              label: 'Name',
              uniqueIdentifier: 'name',
            },
          ],
          [createMockIndex('idx_company_name_new', ['name'], true)],
        ),
        createMockObject(
          'person',
          [
            {
              type: FieldMetadataType.TEXT,
              name: 'email',
              label: 'Email',
              uniqueIdentifier: 'email',
            },
          ],
          [createMockIndex('idx_person_email', ['email'], true)],
        ),
      ];

      const result = service.build({ from: fromObjects, to: toObjects });

      expect(result).toMatchInlineSnapshot(`
{
  "actions": [
    {
      "flatObjectMetadata": {
        "flatFieldMetadatas": [
          {
            "isActive": true,
            "isCustom": true,
            "isNullable": true,
            "label": "Email",
            "name": "email",
            "type": "TEXT",
            "uniqueIdentifier": "email",
          },
        ],
        "flatIndexMetadatas": [
          {
            "flatIndexFieldMetadatas": [
              {
                "order": 0,
                "uniqueIdentifier": "idx_person_email-field-0",
              },
            ],
            "indexType": "BTREE",
            "indexWhereClause": null,
            "isUnique": true,
            "name": "idx_person_email",
            "uniqueIdentifier": "idx_person_email",
          },
        ],
        "uniqueIdentifier": "person",
      },
      "type": "create_object",
    },
    {
      "flatFieldMetadata": {
        "isActive": true,
        "isCustom": true,
        "isNullable": true,
        "label": "Email",
        "name": "email",
        "type": "TEXT",
        "uniqueIdentifier": "email",
      },
      "flatObjectMetadata": {
        "flatFieldMetadatas": [
          {
            "isActive": true,
            "isCustom": true,
            "isNullable": true,
            "label": "Email",
            "name": "email",
            "type": "TEXT",
            "uniqueIdentifier": "email",
          },
        ],
        "flatIndexMetadatas": [
          {
            "flatIndexFieldMetadatas": [
              {
                "order": 0,
                "uniqueIdentifier": "idx_person_email-field-0",
              },
            ],
            "indexType": "BTREE",
            "indexWhereClause": null,
            "isUnique": true,
            "name": "idx_person_email",
            "uniqueIdentifier": "idx_person_email",
          },
        ],
        "uniqueIdentifier": "person",
      },
      "type": "create_field",
    },
    {
      "flatIndexMetadata": {
        "flatIndexFieldMetadatas": [
          {
            "order": 0,
            "uniqueIdentifier": "idx_person_email-field-0",
          },
        ],
        "indexType": "BTREE",
        "indexWhereClause": null,
        "isUnique": true,
        "name": "idx_person_email",
        "uniqueIdentifier": "idx_person_email",
      },
      "type": "create_index",
    },
    {
      "flatIndexMetadata": {
        "flatIndexFieldMetadatas": [
          {
            "order": 0,
            "uniqueIdentifier": "idx_company_name_new-field-0",
          },
        ],
        "indexType": "BTREE",
        "indexWhereClause": null,
        "isUnique": true,
        "name": "idx_company_name_new",
        "uniqueIdentifier": "idx_company_name_new",
      },
      "type": "create_index",
    },
    {
      "flatIndexMetadata": {
        "flatIndexFieldMetadatas": [
          {
            "order": 0,
            "uniqueIdentifier": "idx_company_name_old-field-0",
          },
        ],
        "indexType": "BTREE",
        "indexWhereClause": null,
        "isUnique": true,
        "name": "idx_company_name_old",
        "uniqueIdentifier": "idx_company_name_old",
      },
      "type": "delete_index",
    },
  ],
}
`);
    });

    it('should handle empty objects', () => {
      const result = service.build({ from: [], to: [] });

      expect(result).toMatchInlineSnapshot(`
{
  "actions": [],
}
`);
    });

    it('should handle objects with no index changes', () => {
      const objects = [
        createMockObject('company', [
          {
            type: FieldMetadataType.TEXT,
            name: 'name',
            label: 'Name',
            uniqueIdentifier: 'name',
          },
        ]),
      ];

      const result = service.build({ from: objects, to: objects });

      expect(result).toMatchInlineSnapshot(`
{
  "actions": [],
}
`);
    });

    it('should handle index updates', () => {
      const fromObjects: FlatObjectMetadata[] = [
        createMockObject(
          'company',
          [
            {
              type: FieldMetadataType.TEXT,
              name: 'name',
              label: 'Name',
              uniqueIdentifier: 'name',
            },
          ],
          [createMockIndex('idx_company_name', ['name'], true)],
        ),
      ];

      const toObjects: FlatObjectMetadata[] = [
        createMockObject(
          'company',
          [
            {
              type: FieldMetadataType.TEXT,
              name: 'name',
              label: 'Name',
              uniqueIdentifier: 'name',
            },
          ],
          [createMockIndex('idx_company_name', ['name'], false)],
        ),
      ];

      const result = service.build({ from: fromObjects, to: toObjects });

      expect(result).toMatchInlineSnapshot(`
{
  "actions": [
    {
      "flatIndexMetadata": {
        "flatIndexFieldMetadatas": [
          {
            "order": 0,
            "uniqueIdentifier": "idx_company_name-field-0",
          },
        ],
        "indexType": "BTREE",
        "indexWhereClause": null,
        "isUnique": true,
        "name": "idx_company_name",
        "uniqueIdentifier": "idx_company_name",
      },
      "type": "delete_index",
    },
    {
      "flatIndexMetadata": {
        "flatIndexFieldMetadatas": [
          {
            "order": 0,
            "uniqueIdentifier": "idx_company_name-field-0",
          },
        ],
        "indexType": "BTREE",
        "indexWhereClause": null,
        "isUnique": false,
        "name": "idx_company_name",
        "uniqueIdentifier": "idx_company_name",
      },
      "type": "create_index",
    },
  ],
}
`);
    });

    it('should not generate any actions when indexes are identical', () => {
      const objects = [
        createMockObject(
          'company',
          [
            {
              type: FieldMetadataType.TEXT,
              name: 'name',
              label: 'Name',
              uniqueIdentifier: 'name',
            },
          ],
          [createMockIndex('idx_company_name', ['name'], true)],
        ),
      ];

      const result = service.build({ from: objects, to: objects });

      expect(result).toMatchInlineSnapshot(`
{
  "actions": [],
}
`);
    });
  });
});
