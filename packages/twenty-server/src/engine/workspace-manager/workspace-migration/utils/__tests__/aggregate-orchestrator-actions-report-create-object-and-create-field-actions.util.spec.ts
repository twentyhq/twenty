import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { getUniversalFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-universal-flat-field-metadata.mock';
import { getUniversalFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-universal-flat-object-metadata.mock';
import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-actions-report.constant';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { aggregateOrchestratorActionsReportCreateObjectAndCreateFieldActions } from 'src/engine/workspace-manager/workspace-migration/utils/aggregate-orchestrator-actions-report-create-object-and-create-field-actions.util';
import { type UniversalCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { type UniversalCreateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';

type CreateAggregationTestCase = EachTestingContext<{
  input: OrchestratorActionsReport;
  expected: {
    expectCreateFieldActionPerObjectMetadataUniversalIdentifier: Record<
      string,
      number
    >;
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
              } satisfies UniversalCreateObjectAction,
            ],
            update: [],
            delete: [],
          },
          fieldMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataUniversalIdentifier: 'object-1',
                universalFlatFieldMetadatas: [
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-1',
                    objectMetadataUniversalIdentifier: 'object-1',
                    type: FieldMetadataType.TEXT,
                    name: 'firstName',
                  }),
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-2',
                    objectMetadataUniversalIdentifier: 'object-1',
                    type: FieldMetadataType.TEXT,
                    name: 'lastName',
                  }),
                ],
              } satisfies UniversalCreateFieldAction,
            ],
            update: [],
            delete: [],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectCreateFieldActionPerObjectMetadataUniversalIdentifier: {},
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
                objectMetadataUniversalIdentifier: 'object-1',
                universalFlatFieldMetadatas: [
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-1',
                    objectMetadataUniversalIdentifier: 'object-1',
                    type: FieldMetadataType.TEXT,
                    name: 'firstName',
                  }),
                ],
              } satisfies UniversalCreateFieldAction,
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataUniversalIdentifier: 'object-1',
                universalFlatFieldMetadatas: [
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-2',
                    objectMetadataUniversalIdentifier: 'object-1',
                    type: FieldMetadataType.TEXT,
                    name: 'secondName',
                  }),
                ],
              } satisfies UniversalCreateFieldAction,
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataUniversalIdentifier: 'object-1',
                universalFlatFieldMetadatas: [
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-3',
                    objectMetadataUniversalIdentifier: 'object-1',
                    type: FieldMetadataType.TEXT,
                    name: 'lastName',
                  }),
                ],
              } satisfies UniversalCreateFieldAction,
            ],
            update: [],
            delete: [],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectCreateFieldActionPerObjectMetadataUniversalIdentifier: {
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
              } satisfies UniversalCreateObjectAction,
              {
                type: 'create',
                metadataName: 'objectMetadata',
                flatEntity: getUniversalFlatObjectMetadataMock({
                  universalIdentifier: 'object-2',
                  nameSingular: 'company',
                  namePlural: 'companies',
                }),
                universalFlatFieldMetadatas: [],
              } satisfies UniversalCreateObjectAction,
            ],
            update: [],
            delete: [],
          },
          fieldMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataUniversalIdentifier: 'object-1',
                universalFlatFieldMetadatas: [
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-1',
                    objectMetadataUniversalIdentifier: 'object-1',
                    type: FieldMetadataType.TEXT,
                    name: 'firstName',
                  }),
                ],
              } satisfies UniversalCreateFieldAction,
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataUniversalIdentifier: 'object-2',
                universalFlatFieldMetadatas: [
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-2',
                    objectMetadataUniversalIdentifier: 'object-2',
                    type: FieldMetadataType.TEXT,
                    name: 'name',
                  }),
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-3',
                    objectMetadataUniversalIdentifier: 'object-2',
                    type: FieldMetadataType.TEXT,
                    name: 'industry',
                  }),
                ],
              } satisfies UniversalCreateFieldAction,
            ],
            update: [],
            delete: [],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectCreateFieldActionPerObjectMetadataUniversalIdentifier: {},
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
              } satisfies UniversalCreateObjectAction,
            ],
            update: [],
            delete: [],
          },
          fieldMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataUniversalIdentifier: 'object-1',
                universalFlatFieldMetadatas: [
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-1',
                    objectMetadataUniversalIdentifier: 'object-1',
                    type: FieldMetadataType.TEXT,
                    name: 'firstName',
                  }),
                ],
              } satisfies UniversalCreateFieldAction,
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataUniversalIdentifier: 'object-2',
                universalFlatFieldMetadatas: [
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-2',
                    objectMetadataUniversalIdentifier: 'object-2',
                    type: FieldMetadataType.TEXT,
                    name: 'orphanField',
                  }),
                ],
              } satisfies UniversalCreateFieldAction,
            ],
            update: [],
            delete: [],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectCreateFieldActionPerObjectMetadataUniversalIdentifier: {
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
                objectMetadataUniversalIdentifier: 'object-1',
                universalFlatFieldMetadatas: [
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-1',
                    objectMetadataUniversalIdentifier: 'object-1',
                    type: FieldMetadataType.TEXT,
                    name: 'firstName',
                  }),
                ],
              } satisfies UniversalCreateFieldAction,
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataUniversalIdentifier: 'object-1',
                universalFlatFieldMetadatas: [
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-2',
                    objectMetadataUniversalIdentifier: 'object-1',
                    type: FieldMetadataType.TEXT,
                    name: 'lastName',
                  }),
                ],
              } satisfies UniversalCreateFieldAction,
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataUniversalIdentifier: 'object-1',
                universalFlatFieldMetadatas: [
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-3',
                    objectMetadataUniversalIdentifier: 'object-1',
                    type: FieldMetadataType.TEXT,
                    name: 'email',
                  }),
                ],
              } satisfies UniversalCreateFieldAction,
            ],
            update: [],
            delete: [],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectCreateFieldActionPerObjectMetadataUniversalIdentifier: {
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
          expectCreateFieldActionPerObjectMetadataUniversalIdentifier: {},
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
              } satisfies UniversalCreateObjectAction,
            ],
            update: [],
            delete: [],
          },
          fieldMetadata: {
            create: [
              {
                type: 'create',
                metadataName: 'fieldMetadata',
                objectMetadataUniversalIdentifier: 'object-1',
                universalFlatFieldMetadatas: [
                  getUniversalFlatFieldMetadataMock({
                    universalIdentifier: 'field-1',
                    objectMetadataUniversalIdentifier: 'object-1',
                    type: FieldMetadataType.RELATION,
                    name: 'author',
                  }),
                ],
              } satisfies UniversalCreateFieldAction,
            ],
            update: [],
            delete: [],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectCreateFieldActionPerObjectMetadataUniversalIdentifier: {
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

      const fieldActions = result.fieldMetadata
        .create as UniversalCreateFieldAction[];
      const fieldActionCounts = fieldActions.reduce(
        (acc, action) => {
          acc[action.objectMetadataUniversalIdentifier] =
            (acc[action.objectMetadataUniversalIdentifier] || 0) + 1;

          return acc;
        },
        {} as Record<string, number>,
      );

      const objectActions = result.objectMetadata
        .create as UniversalCreateObjectAction[];
      const objectActionCounts = objectActions.reduce(
        (acc, action) => {
          acc[action.flatEntity.universalIdentifier] =
            (acc[action.flatEntity.universalIdentifier] || 0) + 1;

          return acc;
        },
        {} as Record<string, number>,
      );

      Object.entries(
        expected.expectCreateFieldActionPerObjectMetadataUniversalIdentifier,
      ).forEach(([objectMetadataUniversalIdentifier, expectedCount]) => {
        expect(fieldActionCounts[objectMetadataUniversalIdentifier]).toBe(
          expectedCount,
        );
      });

      Object.entries(
        expected.expectCreateObjectActionPerObjectMetadataUniversalIdentifier,
      ).forEach(([objectMetadataUniversalIdentifier, expectedCount]) => {
        expect(objectActionCounts[objectMetadataUniversalIdentifier]).toBe(
          expectedCount,
        );
      });

      // Check total counts
      const expectedTotalFieldActions = Object.values(
        expected.expectCreateFieldActionPerObjectMetadataUniversalIdentifier,
      ).reduce((sum: number, count: number) => sum + count, 0);
      const expectedTotalObjectActions = Object.values(
        expected.expectCreateObjectActionPerObjectMetadataUniversalIdentifier,
      ).reduce((sum: number, count: number) => sum + count, 0);

      expect(fieldActions).toHaveLength(expectedTotalFieldActions);
      expect(objectActions).toHaveLength(expectedTotalObjectActions);
    },
  );
});
