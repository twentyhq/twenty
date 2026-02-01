import { FieldMetadataType } from 'twenty-shared/types';

import { getUniversalFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-universal-flat-field-metadata.mock';
import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-actions-report.constant';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { aggregateRelationFieldPairs } from 'src/engine/workspace-manager/workspace-migration/utils/aggregate-relation-field-pairs.util';
import { type UniversalCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';

describe('aggregateRelationFieldPairs', () => {
  it('should bundle relation field pairs into single action with merged fieldIdByUniversalIdentifier', () => {
    const attachmentObjectId = 'attachment-object';
    const taskObjectId = 'task-object';
    const targetTaskFieldId = 'target-task-field';
    const attachmentsFieldId = 'attachments-field';

    const input: OrchestratorActionsReport = {
      ...createEmptyOrchestratorActionsReport(),
      fieldMetadata: {
        create: [
          {
            type: 'create',
            metadataName: 'fieldMetadata',
            universalFlatFieldMetadatas: [
              getUniversalFlatFieldMetadataMock({
                universalIdentifier: targetTaskFieldId,
                objectMetadataUniversalIdentifier: attachmentObjectId,
                type: FieldMetadataType.RELATION,
                name: 'targetTask',
                relationTargetFieldMetadataUniversalIdentifier:
                  attachmentsFieldId,
                relationTargetObjectMetadataUniversalIdentifier: taskObjectId,
              }),
            ],
            fieldIdByUniversalIdentifier: {
              [targetTaskFieldId]: 'target-task-generated-id',
            },
          } satisfies UniversalCreateFieldAction,
          {
            type: 'create',
            metadataName: 'fieldMetadata',
            universalFlatFieldMetadatas: [
              getUniversalFlatFieldMetadataMock({
                universalIdentifier: attachmentsFieldId,
                objectMetadataUniversalIdentifier: taskObjectId,
                type: FieldMetadataType.RELATION,
                name: 'attachments',
                relationTargetFieldMetadataUniversalIdentifier:
                  targetTaskFieldId,
                relationTargetObjectMetadataUniversalIdentifier:
                  attachmentObjectId,
              }),
            ],
            fieldIdByUniversalIdentifier: {
              [attachmentsFieldId]: 'attachments-generated-id',
            },
          } satisfies UniversalCreateFieldAction,
        ],
        update: [],
        delete: [],
      },
    };

    const result = aggregateRelationFieldPairs({
      orchestratorActionsReport: input,
    });

    // Should be bundled into a single action with both fields and merged ID map
    expect(result.fieldMetadata.create).toMatchObject([
      {
        universalFlatFieldMetadatas: [
          { universalIdentifier: targetTaskFieldId },
          { universalIdentifier: attachmentsFieldId },
        ],
        fieldIdByUniversalIdentifier: {
          [targetTaskFieldId]: 'target-task-generated-id',
          [attachmentsFieldId]: 'attachments-generated-id',
        },
      },
    ]);
  });

  it('should keep standalone fields (no relation target) as separate actions', () => {
    const fieldUniversalId = 'standalone-field';
    const objectUniversalId = 'some-object';

    const input: OrchestratorActionsReport = {
      ...createEmptyOrchestratorActionsReport(),
      fieldMetadata: {
        create: [
          {
            type: 'create',
            metadataName: 'fieldMetadata',
            universalFlatFieldMetadatas: [
              getUniversalFlatFieldMetadataMock({
                universalIdentifier: fieldUniversalId,
                objectMetadataUniversalIdentifier: objectUniversalId,
                type: FieldMetadataType.TEXT,
                name: 'standaloneField',
              }),
            ],
            fieldIdByUniversalIdentifier: {
              [fieldUniversalId]: 'standalone-field-id',
            },
          } satisfies UniversalCreateFieldAction,
        ],
        update: [],
        delete: [],
      },
    };

    const result = aggregateRelationFieldPairs({
      orchestratorActionsReport: input,
    });

    // Should remain as single action
    expect(result.fieldMetadata.create).toMatchObject([
      {
        universalFlatFieldMetadatas: [
          { universalIdentifier: fieldUniversalId },
        ],
      },
    ]);
  });

  it('should handle relation field with target not being created (existing field)', () => {
    const relationFieldId = 'new-relation-field';
    const existingTargetFieldId = 'existing-target-field';
    const objectUniversalId = 'some-object';

    const input: OrchestratorActionsReport = {
      ...createEmptyOrchestratorActionsReport(),
      fieldMetadata: {
        create: [
          {
            type: 'create',
            metadataName: 'fieldMetadata',
            universalFlatFieldMetadatas: [
              getUniversalFlatFieldMetadataMock({
                universalIdentifier: relationFieldId,
                objectMetadataUniversalIdentifier: objectUniversalId,
                type: FieldMetadataType.RELATION,
                name: 'relationToExisting',
                relationTargetFieldMetadataUniversalIdentifier:
                  existingTargetFieldId,
                relationTargetObjectMetadataUniversalIdentifier: 'other-object',
              }),
            ],
            fieldIdByUniversalIdentifier: {
              [relationFieldId]: 'new-relation-field-id',
            },
          } satisfies UniversalCreateFieldAction,
        ],
        update: [],
        delete: [],
      },
    };

    const result = aggregateRelationFieldPairs({
      orchestratorActionsReport: input,
    });

    // Should remain as single action (target not being created)
    expect(result.fieldMetadata.create).toHaveLength(1);

    const action = result.fieldMetadata.create[0] as UniversalCreateFieldAction;

    expect(action.universalFlatFieldMetadatas).toHaveLength(1);
    expect(action.universalFlatFieldMetadatas[0].universalIdentifier).toBe(
      relationFieldId,
    );
  });

  it('should handle multiple independent relation pairs', () => {
    const pair1FieldA = 'pair1-field-a';
    const pair1FieldB = 'pair1-field-b';
    const pair2FieldA = 'pair2-field-a';
    const pair2FieldB = 'pair2-field-b';

    const input: OrchestratorActionsReport = {
      ...createEmptyOrchestratorActionsReport(),
      fieldMetadata: {
        create: [
          {
            type: 'create',
            metadataName: 'fieldMetadata',
            universalFlatFieldMetadatas: [
              getUniversalFlatFieldMetadataMock({
                universalIdentifier: pair1FieldA,
                objectMetadataUniversalIdentifier: 'object-1',
                type: FieldMetadataType.RELATION,
                name: 'pair1FieldA',
                relationTargetFieldMetadataUniversalIdentifier: pair1FieldB,
                relationTargetObjectMetadataUniversalIdentifier: 'object-2',
              }),
            ],
            fieldIdByUniversalIdentifier: { [pair1FieldA]: 'id-1a' },
          } satisfies UniversalCreateFieldAction,
          {
            type: 'create',
            metadataName: 'fieldMetadata',
            universalFlatFieldMetadatas: [
              getUniversalFlatFieldMetadataMock({
                universalIdentifier: pair1FieldB,
                objectMetadataUniversalIdentifier: 'object-2',
                type: FieldMetadataType.RELATION,
                name: 'pair1FieldB',
                relationTargetFieldMetadataUniversalIdentifier: pair1FieldA,
                relationTargetObjectMetadataUniversalIdentifier: 'object-1',
              }),
            ],
            fieldIdByUniversalIdentifier: { [pair1FieldB]: 'id-1b' },
          } satisfies UniversalCreateFieldAction,
          {
            type: 'create',
            metadataName: 'fieldMetadata',
            universalFlatFieldMetadatas: [
              getUniversalFlatFieldMetadataMock({
                universalIdentifier: pair2FieldA,
                objectMetadataUniversalIdentifier: 'object-3',
                type: FieldMetadataType.RELATION,
                name: 'pair2FieldA',
                relationTargetFieldMetadataUniversalIdentifier: pair2FieldB,
                relationTargetObjectMetadataUniversalIdentifier: 'object-4',
              }),
            ],
            fieldIdByUniversalIdentifier: { [pair2FieldA]: 'id-2a' },
          } satisfies UniversalCreateFieldAction,
          {
            type: 'create',
            metadataName: 'fieldMetadata',
            universalFlatFieldMetadatas: [
              getUniversalFlatFieldMetadataMock({
                universalIdentifier: pair2FieldB,
                objectMetadataUniversalIdentifier: 'object-4',
                type: FieldMetadataType.RELATION,
                name: 'pair2FieldB',
                relationTargetFieldMetadataUniversalIdentifier: pair2FieldA,
                relationTargetObjectMetadataUniversalIdentifier: 'object-3',
              }),
            ],
            fieldIdByUniversalIdentifier: { [pair2FieldB]: 'id-2b' },
          } satisfies UniversalCreateFieldAction,
        ],
        update: [],
        delete: [],
      },
    };

    const result = aggregateRelationFieldPairs({
      orchestratorActionsReport: input,
    });

    // Should result in 2 bundled actions (one per pair), each with merged fieldIdByUniversalIdentifier
    expect(result.fieldMetadata.create).toMatchObject([
      {
        universalFlatFieldMetadatas: [
          { universalIdentifier: pair1FieldA },
          { universalIdentifier: pair1FieldB },
        ],
        fieldIdByUniversalIdentifier: {
          [pair1FieldA]: 'id-1a',
          [pair1FieldB]: 'id-1b',
        },
      },
      {
        universalFlatFieldMetadatas: [
          { universalIdentifier: pair2FieldA },
          { universalIdentifier: pair2FieldB },
        ],
        fieldIdByUniversalIdentifier: {
          [pair2FieldA]: 'id-2a',
          [pair2FieldB]: 'id-2b',
        },
      },
    ]);
  });
});
