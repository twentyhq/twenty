import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getUniversalFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-universal-flat-object-metadata.mock';
import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-actions-report.constant';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { aggregateOrchestratorActionsReportCreateObjectAndCreateFieldActions } from 'src/engine/workspace-manager/workspace-migration/utils/aggregate-orchestrator-actions-report-create-object-and-create-field-actions.util';
import { type CreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { type CreateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';

type CreateAggregationTestCase = EachTestingContext<{
  input: OrchestratorActionsReport;
  expected: {
    expectCreateFieldActionPerObjectMetadataId: Record<string, number>;
    expectCreateObjectActionPerObjectMetadataUniversalIdentifier: Record<
      string,
      number
    >;
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
                flatEntity: getUniversalFlatObjectMetadataMock({
                  universalIdentifier: 'object-1',
                  nameSingular: 'user',
                  namePlural: 'users',
                }),
                universalFlatFieldMetadatas: [],
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
                    name: 'firstName',
                  }),
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-2',
                    objectMetadataId: 'object-1',
                    type: FieldMetadataType.TEXT,
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
          expectCreateObjectActionPerObjectMetadataUniversalIdentifier: {
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
          expectCreateObjectActionPerObjectMetadataUniversalIdentifier: {},
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
                flatEntity: getUniversalFlatObjectMetadataMock({
                  universalIdentifier: 'object-1',
                  nameSingular: 'user',
                  namePlural: 'users',
                }),
                universalFlatFieldMetadatas: [],
              } satisfies CreateObjectAction,
              {
                type: 'create',
                metadataName: 'objectMetadata',
                flatEntity: getUniversalFlatObjectMetadataMock({
                  universalIdentifier: 'object-2',
                  nameSingular: 'company',
                  namePlural: 'companies',
                }),
                universalFlatFieldMetadatas: [],
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
                    name: 'name',
                  }),
                  getFlatFieldMetadataMock({
                    universalIdentifier: 'field-3',
                    objectMetadataId: 'object-2',
                    type: FieldMetadataType.TEXT,
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
          expectCreateObjectActionPerObjectMetadataUniversalIdentifier: {
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
                flatEntity: getUniversalFlatObjectMetadataMock({
                  universalIdentifier: 'object-1',
                  nameSingular: 'user',
                  namePlural: 'users',
                }),
                universalFlatFieldMetadatas: [],
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
          expectCreateObjectActionPerObjectMetadataUniversalIdentifier: {
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
          expectCreateObjectActionPerObjectMetadataUniversalIdentifier: {},
        },
      },
    },
    {
      title: 'should handle empty actions report',
      context: {
        input: createEmptyOrchestratorActionsReport(),
        expected: {
          expectCreateFieldActionPerObjectMetadataId: {},
          expectCreateObjectActionPerObjectMetadataUniversalIdentifier: {},
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
                flatEntity: getUniversalFlatObjectMetadataMock({
                  universalIdentifier: 'object-1',
                  nameSingular: 'attachment',
                  namePlural: 'attachments',
                }),
                universalFlatFieldMetadatas: [],
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
          expectCreateObjectActionPerObjectMetadataUniversalIdentifier: {
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
          acc[action.flatEntity.universalIdentifier] =
            (acc[action.flatEntity.universalIdentifier] || 0) + 1;

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
        expected.expectCreateObjectActionPerObjectMetadataUniversalIdentifier,
      ).forEach(([objectId, expectedCount]) => {
        expect(objectActionCounts[objectId]).toBe(expectedCount);
      });

      // Check total counts
      const expectedTotalFieldActions = Object.values(
        expected.expectCreateFieldActionPerObjectMetadataId,
      ).reduce((sum: number, count: number) => sum + count, 0);
      const expectedTotalObjectActions = Object.values(
        expected.expectCreateObjectActionPerObjectMetadataUniversalIdentifier,
      ).reduce((sum: number, count: number) => sum + count, 0);

      expect(fieldActions).toHaveLength(expectedTotalFieldActions);
      expect(objectActions).toHaveLength(expectedTotalObjectActions);
    },
  );
});
