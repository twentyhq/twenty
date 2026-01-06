import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/constant/empty-orchestrator-actions-report.constant';
import { aggregateOrchestratorActionsReportDeprioritizeSearchVectorUpdateFieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/utils/aggregate-orchestrator-actions-report-deprioritize-search-vector-update-field-actions.util';
import { type UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';

describe('aggregateOrchestratorActionsReportDeprioritizeSearchVectorUpdateFieldActions', () => {
  it('should move searchVector update actions to the end of the update list', () => {
    const orchestratorActionsReport = {
      ...createEmptyOrchestratorActionsReport(),
      fieldMetadata: {
        create: [],
        update: [
          {
            type: 'update',
            metadataName: 'fieldMetadata',
            entityId: 'search-vector-field-1',
            objectMetadataId: 'object-1',
            updates: [
              {
                property: 'label',
                from: 'Search Vector',
                to: 'Updated Search Vector',
              },
            ],
          } satisfies UpdateFieldAction,
          {
            type: 'update',
            metadataName: 'fieldMetadata',
            entityId: 'regular-field-1',
            objectMetadataId: 'object-1',
            updates: [
              {
                property: 'label',
                from: 'First Name',
                to: 'Updated First Name',
              },
            ],
          } satisfies UpdateFieldAction,
          {
            type: 'update',
            metadataName: 'fieldMetadata',
            entityId: 'regular-field-2',
            objectMetadataId: 'object-1',
            updates: [
              {
                property: 'label',
                from: 'Last Name',
                to: 'Updated Last Name',
              },
            ],
          } satisfies UpdateFieldAction,
        ],
        delete: [],
      },
    };

    const flatFieldMetadataMaps = [
      getFlatFieldMetadataMock({
        universalIdentifier: 'search-vector-field-1',
        objectMetadataId: 'object-1',
        type: FieldMetadataType.TS_VECTOR,
        id: 'search-vector-field-1',
        name: SEARCH_VECTOR_FIELD.name,
      }),
      getFlatFieldMetadataMock({
        universalIdentifier: 'regular-field-1',
        objectMetadataId: 'object-1',
        type: FieldMetadataType.TEXT,
        id: 'regular-field-1',
        name: 'firstName',
      }),
      getFlatFieldMetadataMock({
        universalIdentifier: 'regular-field-2',
        objectMetadataId: 'object-1',
        type: FieldMetadataType.TEXT,
        id: 'regular-field-2',
        name: 'lastName',
      }),
    ].reduce<FlatEntityMaps<FlatFieldMetadata>>(
      (flatEntityMaps, field) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: field,
          flatEntityMaps,
        }),
      createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
    );

    const result =
      aggregateOrchestratorActionsReportDeprioritizeSearchVectorUpdateFieldActions(
        {
          orchestratorActionsReport,
          flatFieldMetadataMaps,
        },
      );

    const updateFieldActions = result.fieldMetadata
      .update as UpdateFieldAction[];

    const actualEntityIds = updateFieldActions.map((action) => action.entityId);

    expect(actualEntityIds).toEqual([
      'regular-field-1',
      'regular-field-2',
      'search-vector-field-1',
    ]);

    expect(result.fieldMetadata.create).toEqual(
      orchestratorActionsReport.fieldMetadata.create,
    );
    expect(result.fieldMetadata.delete).toEqual(
      orchestratorActionsReport.fieldMetadata.delete,
    );
    expect(result.objectMetadata).toEqual(
      orchestratorActionsReport.objectMetadata,
    );
  });
});
