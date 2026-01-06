import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/constant/empty-orchestrator-actions-report.constant';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { aggregateOrchestratorActionsReportCreateObjectAndCreateFieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/utils/aggregate-orchestrator-actions-report-create-object-and-create-field-actions.util';
import { type CreateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';
import { type CreateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/types/workspace-migration-object-action-v2';

type CreateAggregationTestCase = EachTestingContext<{
  input: OrchestratorActionsReport;
  expected: {
    expectCreateFieldActionPerObjectMetadataId: Record<string, number>;
    expectCreateObjectActionPerObjectMetadataId: Record<string, number>;
  };
}>;
describe('aggregateOrchestratorActionsReportCreateObjectAndCreateFieldActions', () => {
  const testCases: CreateAggregationTestCase[] = [
    {
      title:
        'should aggregate single object with multiple fields into one object action',
      context: {
        input: {
          ...createEmptyOrchestratorActionsReport(),
          objectMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'objectMetadata',
                flatEntity: getFlatObjectMetadataMock({
                  universalIdentifier: 'object-1',
                  id: 'object-1',
                  nameSingular: 'user',
                  namePlural: 'users',
                }),
                flatFieldMetadatas: [],
              } satisfies CreateObjectAction,
            ],
            update: [],
            delete: [],
          },
          fieldMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataId: 'object-1',
                flatFieldMetadatas: [
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-1',
                    objectMetadataId: 'object-1',
                    type: FieldMetadataType.TEXT,
                    id: 'field-1',
                    name: 'firstName',
                  }),
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-2',
                    objectMetadataId: 'object-1',
                    type: FieldMetadataType.TEXT,
                    id: 'field-2',
                    name: 'lastName',
                  }),
                ],
              } satisfies CreateFieldAction,
            ],
            update: [],
            delete: [],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectCreateFieldActionPerObjectMetadataId: {},
          expectCreateObjectActionPerObjectMetadataId: {
            'object-1': 1,
          },
        },
      },
    },
    {
      title:
        'should keep separate field actions when no matching object action exists',
      context: {
        input: {
          ...createEmptyOrchestratorActionsReport(),
          objectMetadata: {
            create: [],
            update: [],
            delete: [],
          },
          fieldMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataId: 'object-1',
                flatFieldMetadatas: [
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-1',
                    objectMetadataId: 'object-1',
                    type: FieldMetadataType.TEXT,
                    id: 'field-1',
                    name: 'firstName',
                  }),
                ],
              } satisfies CreateFieldAction,
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataId: 'object-1',
                flatFieldMetadatas: [
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-2',
                    objectMetadataId: 'object-1',
                    type: FieldMetadataType.TEXT,
                    id: 'field-2',
                    name: 'secondName',
                  }),
                ],
              } satisfies CreateFieldAction,
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataId: 'object-1',
                flatFieldMetadatas: [
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-3',
                    objectMetadataId: 'object-1',
                    type: FieldMetadataType.TEXT,
                    id: 'field-3',
                    name: 'lastName',
                  }),
                ],
              } satisfies CreateFieldAction,
            ],
            update: [],
            delete: [],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectCreateFieldActionPerObjectMetadataId: {
            'object-1': 1,
          },
          expectCreateObjectActionPerObjectMetadataId: {},
        },
      },
    },
    {
      title: 'should handle multiple objects with their respective fields',
      context: {
        input: {
          ...createEmptyOrchestratorActionsReport(),
          objectMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'objectMetadata',
                flatEntity: getFlatObjectMetadataMock({
                  universalIdentifier: 'object-1',
                  id: 'object-1',
                  nameSingular: 'user',
                  namePlural: 'users',
                }),
                flatFieldMetadatas: [],
              } satisfies CreateObjectAction,
              {
                type: 'create',
                metadataName: 'objectMetadata',
                flatEntity: getFlatObjectMetadataMock({
                  universalIdentifier: 'object-2',
                  id: 'object-2',
                  nameSingular: 'company',
                  namePlural: 'companies',
                }),
                flatFieldMetadatas: [],
              } satisfies CreateObjectAction,
            ],
            update: [],
            delete: [],
          },
          fieldMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataId: 'object-1',
                flatFieldMetadatas: [
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-1',
                    objectMetadataId: 'object-1',
                    type: FieldMetadataType.TEXT,
                    id: 'field-1',
                    name: 'firstName',
                  }),
                ],
              } satisfies CreateFieldAction,
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataId: 'object-2',
                flatFieldMetadatas: [
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-2',
                    objectMetadataId: 'object-2',
                    type: FieldMetadataType.TEXT,
                    id: 'field-2',
                    name: 'name',
                  }),
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-3',
                    objectMetadataId: 'object-2',
                    type: FieldMetadataType.TEXT,
                    id: 'field-3',
                    name: 'industry',
                  }),
                ],
              } satisfies CreateFieldAction,
            ],
            update: [],
            delete: [],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectCreateFieldActionPerObjectMetadataId: {},
          expectCreateObjectActionPerObjectMetadataId: {
            'object-1': 1,
            'object-2': 1,
          },
        },
      },
    },
    {
      title:
        'should handle mixed scenario with some fields merged and some kept separate',
      context: {
        input: {
          ...createEmptyOrchestratorActionsReport(),
          objectMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'objectMetadata',
                flatEntity: getFlatObjectMetadataMock({
                  universalIdentifier: 'object-1',
                  id: 'object-1',
                  nameSingular: 'user',
                  namePlural: 'users',
                }),
                flatFieldMetadatas: [],
              } satisfies CreateObjectAction,
            ],
            update: [],
            delete: [],
          },
          fieldMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataId: 'object-1',
                flatFieldMetadatas: [
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-1',
                    objectMetadataId: 'object-1',
                    type: FieldMetadataType.TEXT,
                    id: 'field-1',
                    name: 'firstName',
                  }),
                ],
              } satisfies CreateFieldAction,
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataId: 'object-2',
                flatFieldMetadatas: [
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-2',
                    objectMetadataId: 'object-2',
                    type: FieldMetadataType.TEXT,
                    id: 'field-2',
                    name: 'orphanField',
                  }),
                ],
              } satisfies CreateFieldAction,
            ],
            update: [],
            delete: [],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectCreateFieldActionPerObjectMetadataId: {
            'object-2': 1,
          },
          expectCreateObjectActionPerObjectMetadataId: {
            'object-1': 1,
          },
        },
      },
    },
    {
      title:
        'should aggregate multiple field actions for the same object when no create object action exists',
      context: {
        input: {
          ...createEmptyOrchestratorActionsReport(),
          objectMetadata: {
            create: [],
            update: [],
            delete: [],
          },
          fieldMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataId: 'object-1',
                flatFieldMetadatas: [
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-1',
                    objectMetadataId: 'object-1',
                    type: FieldMetadataType.TEXT,
                    id: 'field-1',
                    name: 'firstName',
                  }),
                ],
              } satisfies CreateFieldAction,
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataId: 'object-1',
                flatFieldMetadatas: [
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-2',
                    objectMetadataId: 'object-1',
                    type: FieldMetadataType.TEXT,
                    id: 'field-2',
                    name: 'lastName',
                  }),
                ],
              } satisfies CreateFieldAction,
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataId: 'object-1',
                flatFieldMetadatas: [
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-3',
                    objectMetadataId: 'object-1',
                    type: FieldMetadataType.TEXT,
                    id: 'field-3',
                    name: 'email',
                  }),
                ],
              } satisfies CreateFieldAction,
            ],
            update: [],
            delete: [],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectCreateFieldActionPerObjectMetadataId: {
            'object-1': 1,
          },
          expectCreateObjectActionPerObjectMetadataId: {},
        },
      },
    },
    {
      title: 'should handle empty actions report',
      context: {
        input: createEmptyOrchestratorActionsReport(),
        expected: {
          expectCreateFieldActionPerObjectMetadataId: {},
          expectCreateObjectActionPerObjectMetadataId: {},
        },
      },
    },
    {
      title:
        'should not merge create_field actions containing relation fields into create_object',
      context: {
        input: {
          ...createEmptyOrchestratorActionsReport(),
          objectMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'objectMetadata',
                flatEntity: getFlatObjectMetadataMock({
                  universalIdentifier: 'object-1',
                  id: 'object-1',
                  nameSingular: 'attachment',
                  namePlural: 'attachments',
                }),
                flatFieldMetadatas: [],
              } satisfies CreateObjectAction,
            ],
            update: [],
            delete: [],
          },
          fieldMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataId: 'object-1',
                flatFieldMetadatas: [
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-1',
                    objectMetadataId: 'object-1',
                    type: FieldMetadataType.RELATION,
                    id: 'field-1',
                    name: 'author',
                  }),
                ],
              } satisfies CreateFieldAction,
            ],
            update: [],
            delete: [],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectCreateFieldActionPerObjectMetadataId: {
            'object-1': 1,
          },
          expectCreateObjectActionPerObjectMetadataId: {
            'object-1': 1,
          },
        },
      },
    },
  ];

  test.each(eachTestingContextFilter(testCases))(
    '$title',
    ({ context: { input, expected } }) => {
      const result =
        aggregateOrchestratorActionsReportCreateObjectAndCreateFieldActions({
          orchestratorActionsReport: input,
        });

      const fieldActions = result.fieldMetadata.create as CreateFieldAction[];
      const fieldActionCounts = fieldActions.reduce(
        (acc, action) => {
          acc[action.objectMetadataId] =
            (acc[action.objectMetadataId] || 0) + 1;

          return acc;
        },
        {} as Record<string, number>,
      );

      const objectActions = result.objectMetadata
        .create as CreateObjectAction[];
      const objectActionCounts = objectActions.reduce(
        (acc, action) => {
          acc[action.flatEntity.id] = (acc[action.flatEntity.id] || 0) + 1;

          return acc;
        },
        {} as Record<string, number>,
      );

      Object.entries(
        expected.expectCreateFieldActionPerObjectMetadataId,
      ).forEach(([objectId, expectedCount]) => {
        expect(fieldActionCounts[objectId]).toBe(expectedCount);
      });

      Object.entries(
        expected.expectCreateObjectActionPerObjectMetadataId,
      ).forEach(([objectId, expectedCount]) => {
        expect(objectActionCounts[objectId]).toBe(expectedCount);
      });

      // Check total counts
      const expectedTotalFieldActions = Object.values(
        expected.expectCreateFieldActionPerObjectMetadataId,
      ).reduce((sum, count) => sum + count, 0);
      const expectedTotalObjectActions = Object.values(
        expected.expectCreateObjectActionPerObjectMetadataId,
      ).reduce((sum, count) => sum + count, 0);

      expect(fieldActions).toHaveLength(expectedTotalFieldActions);
      expect(objectActions).toHaveLength(expectedTotalObjectActions);
    },
  );
});
