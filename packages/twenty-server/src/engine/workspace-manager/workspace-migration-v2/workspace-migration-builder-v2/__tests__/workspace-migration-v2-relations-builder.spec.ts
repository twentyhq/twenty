import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { WorkspaceMigrationFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';

describe('Workspace migration builder relations tests suite', () => {
  let service: WorkspaceMigrationBuilderV2Service;

  beforeEach(() => {
    service = new WorkspaceMigrationBuilderV2Service();
  });

  const createMockObject = (
    identifier: string,
    fields: Partial<WorkspaceMigrationFieldInput>[] = [],
  ): WorkspaceMigrationObjectInput => ({
    uniqueIdentifier: identifier,
    fieldInputs: fields.map((field) => ({
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

  describe('buildWorkspaceMigrationV2RelationActions', () => {
    it('should create relation actions for created fields', () => {
      const fromObjects: WorkspaceMigrationObjectInput[] = [];
      const toObjects: WorkspaceMigrationObjectInput[] = [
        createMockObject('company', [
          {
            type: FieldMetadataType.RELATION,
            name: 'employees',
            label: 'Employees',
            uniqueIdentifier: 'employees',
            relationTargetFieldMetadataId: 'field-2',
            relationTargetObjectMetadataId: 'obj-2',
          },
        ]),
      ];

      const result = service.build({ from: fromObjects, to: toObjects });

      expect(result).toMatchInlineSnapshot(`
{
  "actions": [
    {
      "objectMetadataInput": {
        "fieldInputs": [
          {
            "isActive": true,
            "isCustom": true,
            "isNullable": true,
            "label": "Employees",
            "name": "employees",
            "relationTargetFieldMetadataId": "field-2",
            "relationTargetObjectMetadataId": "obj-2",
            "type": "RELATION",
            "uniqueIdentifier": "employees",
          },
        ],
        "uniqueIdentifier": "company",
      },
      "type": "create_object",
    },
    {
      "fieldMetadataInput": {
        "isActive": true,
        "isCustom": true,
        "isNullable": true,
        "label": "Employees",
        "name": "employees",
        "relationTargetFieldMetadataId": "field-2",
        "relationTargetObjectMetadataId": "obj-2",
        "type": "RELATION",
        "uniqueIdentifier": "employees",
      },
      "objectMetadataInput": {
        "fieldInputs": [
          {
            "isActive": true,
            "isCustom": true,
            "isNullable": true,
            "label": "Employees",
            "name": "employees",
            "relationTargetFieldMetadataId": "field-2",
            "relationTargetObjectMetadataId": "obj-2",
            "type": "RELATION",
            "uniqueIdentifier": "employees",
          },
        ],
        "uniqueIdentifier": "company",
      },
      "type": "create_field",
    },
  ],
}
`);
    });

    it('should create delete actions for deleted fields', () => {
      const fromObjects: WorkspaceMigrationObjectInput[] = [
        createMockObject('company', [
          {
            type: FieldMetadataType.RELATION,
            name: 'employees',
            label: 'Employees',
            uniqueIdentifier: 'employees',
            relationTargetFieldMetadataId: 'field-2',
            relationTargetObjectMetadataId: 'obj-2',
          },
        ]),
      ];
      const toObjects: WorkspaceMigrationObjectInput[] = [
        createMockObject('company'),
      ];

      const result = service.build({ from: fromObjects, to: toObjects });

      expect(result).toMatchInlineSnapshot(`
{
  "actions": [
    {
      "fieldMetadataInput": {
        "isActive": true,
        "isCustom": true,
        "isNullable": true,
        "label": "Employees",
        "name": "employees",
        "relationTargetFieldMetadataId": "field-2",
        "relationTargetObjectMetadataId": "obj-2",
        "type": "RELATION",
        "uniqueIdentifier": "employees",
      },
      "objectMetadataInput": {
        "fieldInputs": [],
        "uniqueIdentifier": "company",
      },
      "type": "delete_field",
    },
  ],
}
`);
    });

    it('should handle multiple relation changes across different objects', () => {
      const fromObjects: WorkspaceMigrationObjectInput[] = [
        createMockObject('company', [
          {
            type: FieldMetadataType.RELATION,
            name: 'oldRelation',
            label: 'Old Relation',
            uniqueIdentifier: 'old-relation',
            relationTargetFieldMetadataId: 'field-1',
            relationTargetObjectMetadataId: 'obj-1',
          },
        ]),
      ];
      const toObjects: WorkspaceMigrationObjectInput[] = [
        createMockObject('company', [
          {
            type: FieldMetadataType.RELATION,
            name: 'newRelation',
            label: 'New Relation',
            uniqueIdentifier: 'new-relation',
            relationTargetFieldMetadataId: 'field-2',
            relationTargetObjectMetadataId: 'obj-2',
          },
        ]),
        createMockObject('person', [
          {
            type: FieldMetadataType.RELATION,
            name: 'manager',
            label: 'Manager',
            uniqueIdentifier: 'manager',
            relationTargetFieldMetadataId: 'field-3',
            relationTargetObjectMetadataId: 'obj-3',
          },
        ]),
      ];

      const result = service.build({ from: fromObjects, to: toObjects });

      expect(result).toMatchInlineSnapshot(`
{
  "actions": [
    {
      "objectMetadataInput": {
        "fieldInputs": [
          {
            "isActive": true,
            "isCustom": true,
            "isNullable": true,
            "label": "Manager",
            "name": "manager",
            "relationTargetFieldMetadataId": "field-3",
            "relationTargetObjectMetadataId": "obj-3",
            "type": "RELATION",
            "uniqueIdentifier": "manager",
          },
        ],
        "uniqueIdentifier": "person",
      },
      "type": "create_object",
    },
    {
      "fieldMetadataInput": {
        "isActive": true,
        "isCustom": true,
        "isNullable": true,
        "label": "Manager",
        "name": "manager",
        "relationTargetFieldMetadataId": "field-3",
        "relationTargetObjectMetadataId": "obj-3",
        "type": "RELATION",
        "uniqueIdentifier": "manager",
      },
      "objectMetadataInput": {
        "fieldInputs": [
          {
            "isActive": true,
            "isCustom": true,
            "isNullable": true,
            "label": "Manager",
            "name": "manager",
            "relationTargetFieldMetadataId": "field-3",
            "relationTargetObjectMetadataId": "obj-3",
            "type": "RELATION",
            "uniqueIdentifier": "manager",
          },
        ],
        "uniqueIdentifier": "person",
      },
      "type": "create_field",
    },
    {
      "fieldMetadataInput": {
        "isActive": true,
        "isCustom": true,
        "isNullable": true,
        "label": "New Relation",
        "name": "newRelation",
        "relationTargetFieldMetadataId": "field-2",
        "relationTargetObjectMetadataId": "obj-2",
        "type": "RELATION",
        "uniqueIdentifier": "new-relation",
      },
      "objectMetadataInput": {
        "fieldInputs": [
          {
            "isActive": true,
            "isCustom": true,
            "isNullable": true,
            "label": "New Relation",
            "name": "newRelation",
            "relationTargetFieldMetadataId": "field-2",
            "relationTargetObjectMetadataId": "obj-2",
            "type": "RELATION",
            "uniqueIdentifier": "new-relation",
          },
        ],
        "uniqueIdentifier": "company",
      },
      "type": "create_field",
    },
    {
      "fieldMetadataInput": {
        "isActive": true,
        "isCustom": true,
        "isNullable": true,
        "label": "Old Relation",
        "name": "oldRelation",
        "relationTargetFieldMetadataId": "field-1",
        "relationTargetObjectMetadataId": "obj-1",
        "type": "RELATION",
        "uniqueIdentifier": "old-relation",
      },
      "objectMetadataInput": {
        "fieldInputs": [
          {
            "isActive": true,
            "isCustom": true,
            "isNullable": true,
            "label": "New Relation",
            "name": "newRelation",
            "relationTargetFieldMetadataId": "field-2",
            "relationTargetObjectMetadataId": "obj-2",
            "type": "RELATION",
            "uniqueIdentifier": "new-relation",
          },
        ],
        "uniqueIdentifier": "company",
      },
      "type": "delete_field",
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

    it('should handle objects with no relation changes', () => {
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

    it('should handle relation field updates', () => {
      const baseField = {
        type: FieldMetadataType.RELATION,
        name: 'employees',
        label: 'Employees',
        uniqueIdentifier: 'employees',
        isCustom: true,
        isActive: true,
        isNullable: true,
        description: 'Company employees',
      };

      const fromObjects: WorkspaceMigrationObjectInput[] = [
        createMockObject('company', [
          {
            ...baseField,
            relationTargetFieldMetadataId: 'field-1',
            relationTargetObjectMetadataId: 'obj-1',
            settings: {
              relationType: RelationType.ONE_TO_MANY,
              onDelete: RelationOnDeleteAction.CASCADE,
            } as FieldMetadataSettings<FieldMetadataType.RELATION>,
          },
        ]),
      ];

      const toObjects: WorkspaceMigrationObjectInput[] = [
        {
          ...fromObjects[0],
          fieldInputs: [
            {
              ...baseField,
              name: 'updatedName',
            },
          ],
        },
      ];

      const result = service.build({ from: fromObjects, to: toObjects });

      expect(result).toMatchInlineSnapshot(`
{
  "actions": [
    {
      "fieldMetadataInput": {
        "description": "Company employees",
        "isActive": true,
        "isCustom": true,
        "isNullable": true,
        "label": "Employees",
        "name": "updatedName",
        "type": "RELATION",
        "uniqueIdentifier": "employees",
      },
      "objectMetadataInput": {
        "fieldInputs": [
          {
            "description": "Company employees",
            "isActive": true,
            "isCustom": true,
            "isNullable": true,
            "label": "Employees",
            "name": "updatedName",
            "type": "RELATION",
            "uniqueIdentifier": "employees",
          },
        ],
        "uniqueIdentifier": "company",
      },
      "type": "update_field",
      "updates": [
        {
          "from": "employees",
          "property": "name",
          "to": "updatedName",
        },
      ],
    },
  ],
}
`);
    });
  });
});
