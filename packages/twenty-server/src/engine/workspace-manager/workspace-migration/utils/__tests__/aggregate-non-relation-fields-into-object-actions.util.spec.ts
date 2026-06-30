import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-actions-report.constant';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { aggregateNonRelationFieldsIntoObjectActions } from 'src/engine/workspace-manager/workspace-migration/utils/aggregate-non-relation-fields-into-object-actions.util';
import { type UniversalCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { type UniversalCreateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';

describe('aggregateNonRelationFieldsIntoObjectActions', () => {
  it('should merge non-relation field into matching create-object action', () => {
    const objectUniversalId = 'object-1';
    const fieldUniversalId = 'field-1';

    const flatFieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: fieldUniversalId,
      objectMetadataId: 'object-metadata-id',
      objectMetadataUniversalIdentifier: objectUniversalId,
      type: FieldMetadataType.TEXT,
      name: 'testField',
    });

    const input: OrchestratorActionsReport = {
      ...createEmptyOrchestratorActionsReport(),
      objectMetadata: {
        create: [
          {
            type: 'create',
            metadataName: 'objectMetadata',
            flatEntity: getFlatObjectMetadataMock({
              universalIdentifier: objectUniversalId,
              nameSingular: 'testObject',
              namePlural: 'testObjects',
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
            flatEntity: flatFieldMetadata,
            id: 'generated-field-id',
          } satisfies UniversalCreateFieldAction,
        ],
        update: [],
        delete: [],
      },
    };

    const result = aggregateNonRelationFieldsIntoObjectActions({
      orchestratorActionsReport: input,
    });

    // Field should be merged into object action
    expect(result.objectMetadata.create).toMatchObject([
      {
        universalFlatFieldMetadatas: [
          { universalIdentifier: fieldUniversalId },
        ],
        fieldIdByUniversalIdentifier: {
          [fieldUniversalId]: 'generated-field-id',
        },
      },
    ]);

    // No remaining field actions
    expect(result.fieldMetadata.create).toHaveLength(0);
  });

  it('should keep relation field in separate create-field action', () => {
    const objectUniversalId = 'object-1';
    const relationFieldUniversalId = 'relation-field-1';
    const targetFieldUniversalId = 'target-field-1';

    const flatRelationFieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: relationFieldUniversalId,
      objectMetadataId: 'object-metadata-id',
      objectMetadataUniversalIdentifier: objectUniversalId,
      type: FieldMetadataType.RELATION,
      name: 'relationField',
      relationTargetFieldMetadataUniversalIdentifier: targetFieldUniversalId,
      relationTargetObjectMetadataUniversalIdentifier: 'other-object',
    });

    const input: OrchestratorActionsReport = {
      ...createEmptyOrchestratorActionsReport(),
      objectMetadata: {
        create: [
          {
            type: 'create',
            metadataName: 'objectMetadata',
            flatEntity: getFlatObjectMetadataMock({
              universalIdentifier: objectUniversalId,
              nameSingular: 'testObject',
              namePlural: 'testObjects',
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
            flatEntity: flatRelationFieldMetadata,
            id: 'generated-relation-field-id',
          } satisfies UniversalCreateFieldAction,
        ],
        update: [],
        delete: [],
      },
    };

    const result = aggregateNonRelationFieldsIntoObjectActions({
      orchestratorActionsReport: input,
    });

    // Object action should have no fields merged
    expect(result.objectMetadata.create).toMatchObject([
      { universalFlatFieldMetadatas: [] },
    ]);

    // Relation field should remain in field actions
    expect(result.fieldMetadata.create).toMatchObject([
      {
        flatEntity: { universalIdentifier: relationFieldUniversalId },
      },
    ]);
  });

  it('should keep field for existing object in separate create-field action', () => {
    const existingObjectUniversalId = 'existing-object';
    const fieldUniversalId = 'field-for-existing-object';

    const flatFieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: fieldUniversalId,
      objectMetadataId: 'existing-object-metadata-id',
      objectMetadataUniversalIdentifier: existingObjectUniversalId,
      type: FieldMetadataType.TEXT,
      name: 'fieldForExistingObject',
    });

    const input: OrchestratorActionsReport = {
      ...createEmptyOrchestratorActionsReport(),
      objectMetadata: {
        create: [], // No objects being created
        update: [],
        delete: [],
      },
      fieldMetadata: {
        create: [
          {
            type: 'create',
            metadataName: 'fieldMetadata',
            flatEntity: flatFieldMetadata,
            id: 'generated-field-id',
          } satisfies UniversalCreateFieldAction,
        ],
        update: [],
        delete: [],
      },
    };

    const result = aggregateNonRelationFieldsIntoObjectActions({
      orchestratorActionsReport: input,
    });

    // No object actions
    expect(result.objectMetadata.create).toHaveLength(0);

    // Field should remain in field actions (no matching object to merge into)
    expect(result.fieldMetadata.create).toMatchObject([
      {
        flatEntity: { universalIdentifier: fieldUniversalId },
      },
    ]);
  });

  it('should handle mixed relation and non-relation fields as separate actions', () => {
    const objectUniversalId = 'object-1';
    const textFieldUniversalId = 'text-field';
    const relationFieldUniversalId = 'relation-field';

    const flatTextFieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: textFieldUniversalId,
      objectMetadataId: 'object-metadata-id',
      objectMetadataUniversalIdentifier: objectUniversalId,
      type: FieldMetadataType.TEXT,
      name: 'textField',
    });

    const flatRelationFieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: relationFieldUniversalId,
      objectMetadataId: 'object-metadata-id',
      objectMetadataUniversalIdentifier: objectUniversalId,
      type: FieldMetadataType.RELATION,
      name: 'relationField',
      relationTargetFieldMetadataUniversalIdentifier: 'target-field',
      relationTargetObjectMetadataUniversalIdentifier: 'other-object',
    });

    const input: OrchestratorActionsReport = {
      ...createEmptyOrchestratorActionsReport(),
      objectMetadata: {
        create: [
          {
            type: 'create',
            metadataName: 'objectMetadata',
            flatEntity: getFlatObjectMetadataMock({
              universalIdentifier: objectUniversalId,
              nameSingular: 'testObject',
              namePlural: 'testObjects',
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
            flatEntity: flatTextFieldMetadata,
            id: 'text-field-id',
          } satisfies UniversalCreateFieldAction,
          {
            type: 'create',
            metadataName: 'fieldMetadata',
            flatEntity: flatRelationFieldMetadata,
            id: 'relation-field-id',
          } satisfies UniversalCreateFieldAction,
        ],
        update: [],
        delete: [],
      },
    };

    const result = aggregateNonRelationFieldsIntoObjectActions({
      orchestratorActionsReport: input,
    });

    // Text field should be merged into object action
    expect(result.objectMetadata.create).toMatchObject([
      {
        universalFlatFieldMetadatas: [
          { universalIdentifier: textFieldUniversalId },
        ],
      },
    ]);

    // Relation field should remain in field actions
    expect(result.fieldMetadata.create).toMatchObject([
      {
        flatEntity: { universalIdentifier: relationFieldUniversalId },
      },
    ]);
  });
});
