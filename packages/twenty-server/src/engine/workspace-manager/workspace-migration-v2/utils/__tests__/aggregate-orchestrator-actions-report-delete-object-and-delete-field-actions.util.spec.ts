import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/constant/empty-orchestrator-actions-report.constant';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { aggregateOrchestratorActionsReportDeleteObjectAndDeleteFieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/utils/aggregate-orchestrator-actions-report-delete-object-and-delete-field.util';
import { type DeleteFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';
import { type DeleteObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/types/workspace-migration-object-action-v2';

type DeleteAggregationTestCase = EachTestingContext<{
  input: OrchestratorActionsReport;
  expected: {
    expectDeleteFieldActionPerObjectMetadataId: Record<string, number>;
    expectDeleteObjectActionPerObjectMetadataId: Record<string, number>;
  };
}>;

describe('aggregateOrchestratorActionsReportDeleteObjectAndDeleteFieldActions', () => {
  const testCases: DeleteAggregationTestCase[] = [
    {
      title: 'should remove field actions when parent object is being deleted',
      context: {
        input: {
          ...createEmptyOrchestratorActionsReport(),
          objectMetadata: {
            create: [],
            update: [],
            delete: [
              {
                type: 'delete',
                metadataName: 'objectMetadata',
                entityId: 'object-1',
              } satisfies DeleteObjectAction,
            ],
          },
          fieldMetadata: {
            create: [],
            update: [],
            delete: [
              {
                type: 'delete',
                metadataName: 'fieldMetadata',
                entityId: 'field-1',
                objectMetadataId: 'object-1',
              } satisfies DeleteFieldAction,
              {
                type: 'delete',
                metadataName: 'fieldMetadata',
                entityId: 'field-2',
                objectMetadataId: 'object-1',
              } satisfies DeleteFieldAction,
            ],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectDeleteFieldActionPerObjectMetadataId: {},
          expectDeleteObjectActionPerObjectMetadataId: {
            'object-1': 1,
          },
        },
      },
    },
    {
      title: 'should keep field actions when no parent object is being deleted',
      context: {
        input: {
          ...createEmptyOrchestratorActionsReport(),
          objectMetadata: {
            create: [],
            update: [],
            delete: [],
          },
          fieldMetadata: {
            create: [],
            update: [],
            delete: [
              {
                type: 'delete',
                metadataName: 'fieldMetadata',
                entityId: 'field-1',
                objectMetadataId: 'object-1',
              } satisfies DeleteFieldAction,
            ],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectDeleteFieldActionPerObjectMetadataId: {
            'object-1': 1,
          },
          expectDeleteObjectActionPerObjectMetadataId: {},
        },
      },
    },
    {
      title:
        'should handle mixed scenario with some fields removed and some kept',
      context: {
        input: {
          ...createEmptyOrchestratorActionsReport(),
          objectMetadata: {
            create: [],
            update: [],
            delete: [
              {
                type: 'delete',
                metadataName: 'objectMetadata',
                entityId: 'object-1',
              } satisfies DeleteObjectAction,
            ],
          },
          fieldMetadata: {
            create: [],
            update: [],
            delete: [
              {
                type: 'delete',
                metadataName: 'fieldMetadata',
                entityId: 'field-1',
                objectMetadataId: 'object-1',
              } satisfies DeleteFieldAction,
              {
                type: 'delete',
                metadataName: 'fieldMetadata',
                entityId: 'field-2',
                objectMetadataId: 'object-2',
              } satisfies DeleteFieldAction,
            ],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectDeleteFieldActionPerObjectMetadataId: {
            'object-2': 1,
          },
          expectDeleteObjectActionPerObjectMetadataId: {
            'object-1': 1,
          },
        },
      },
    },
    {
      title: 'should handle multiple objects with mixed field deletions',
      context: {
        input: {
          ...createEmptyOrchestratorActionsReport(),
          objectMetadata: {
            create: [],
            update: [],
            delete: [
              {
                type: 'delete',
                metadataName: 'objectMetadata',
                entityId: 'object-1',
              } satisfies DeleteObjectAction,
              {
                type: 'delete',
                metadataName: 'objectMetadata',
                entityId: 'object-2',
              } satisfies DeleteObjectAction,
            ],
          },
          fieldMetadata: {
            create: [],
            update: [],
            delete: [
              {
                type: 'delete',
                metadataName: 'fieldMetadata',
                entityId: 'field-1',
                objectMetadataId: 'object-1',
              } satisfies DeleteFieldAction,
              {
                type: 'delete',
                metadataName: 'fieldMetadata',
                entityId: 'field-2',
                objectMetadataId: 'object-2',
              } satisfies DeleteFieldAction,
              {
                type: 'delete',
                metadataName: 'fieldMetadata',
                entityId: 'field-3',
                objectMetadataId: 'object-3',
              } satisfies DeleteFieldAction,
            ],
          },
        } satisfies OrchestratorActionsReport,
        expected: {
          expectDeleteFieldActionPerObjectMetadataId: {
            'object-3': 1,
          },
          expectDeleteObjectActionPerObjectMetadataId: {
            'object-1': 1,
            'object-2': 1,
          },
        },
      },
    },
    {
      title: 'should handle empty actions report',
      context: {
        input: createEmptyOrchestratorActionsReport(),
        expected: {
          expectDeleteFieldActionPerObjectMetadataId: {},
          expectDeleteObjectActionPerObjectMetadataId: {},
        },
      },
    },
  ];

  test.each(eachTestingContextFilter(testCases))(
    '$title',
    ({ context: { input, expected } }) => {
      const result =
        aggregateOrchestratorActionsReportDeleteObjectAndDeleteFieldActions({
          orchestratorActionsReport: input,
        });

      const fieldActions = result.fieldMetadata.delete as DeleteFieldAction[];
      const fieldActionCounts = fieldActions.reduce(
        (acc, action) => {
          acc[action.objectMetadataId] =
            (acc[action.objectMetadataId] || 0) + 1;

          return acc;
        },
        {} as Record<string, number>,
      );

      const objectActions = result.objectMetadata
        .delete as DeleteObjectAction[];
      const objectActionCounts = objectActions.reduce(
        (acc, action) => {
          acc[action.entityId] = (acc[action.entityId] || 0) + 1;

          return acc;
        },
        {} as Record<string, number>,
      );

      Object.entries(
        expected.expectDeleteFieldActionPerObjectMetadataId,
      ).forEach(([objectId, expectedCount]) => {
        expect(fieldActionCounts[objectId]).toBe(expectedCount);
      });

      Object.entries(
        expected.expectDeleteObjectActionPerObjectMetadataId,
      ).forEach(([objectId, expectedCount]) => {
        expect(objectActionCounts[objectId]).toBe(expectedCount);
      });

      // Check total counts
      const expectedTotalFieldActions = Object.values(
        expected.expectDeleteFieldActionPerObjectMetadataId,
      ).reduce((sum, count) => sum + count, 0);
      const expectedTotalObjectActions = Object.values(
        expected.expectDeleteObjectActionPerObjectMetadataId,
      ).reduce((sum, count) => sum + count, 0);

      expect(fieldActions).toHaveLength(expectedTotalFieldActions);
      expect(objectActions).toHaveLength(expectedTotalObjectActions);
    },
  );
});
