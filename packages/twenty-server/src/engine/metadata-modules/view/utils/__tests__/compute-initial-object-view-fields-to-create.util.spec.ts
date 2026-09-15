import { getViewFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

import { computeInitialObjectViewFieldsToCreate } from 'src/engine/metadata-modules/view/utils/compute-initial-object-view-fields-to-create.util';

const applicationUniversalIdentifier = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const objectUniversalIdentifier = 'b1b2b3b4-b5b6-4000-8000-000000000002';
const initialViewUniversalIdentifier = 'c1c2c3c4-c5c6-4000-8000-000000000003';
const labelIdentifierFieldMetadataUniversalIdentifier =
  'd1d2d3d4-d5d6-4000-8000-000000000004';
const callerFieldUniversalIdentifier = 'e1e2e3e4-e5e6-4000-8000-000000000005';

const makeCallerField = (
  universalIdentifier: string,
  name: string,
): UniversalFlatFieldMetadata =>
  ({
    universalIdentifier,
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    applicationUniversalIdentifier,
    name,
    label: name,
    type: FieldMetadataType.TEXT,
    isActive: true,
    isSystem: false,
    isSystemSideEffect: false,
    isUIEditable: true,
    isNullable: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
  }) as unknown as UniversalFlatFieldMetadata;

const sourceFlatObjectMetadata = {
  applicationUniversalIdentifier,
  universalIdentifier: objectUniversalIdentifier,
  labelIdentifierFieldMetadataUniversalIdentifier,
};

const allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName =
  {
    fieldMetadata: {
      flatEntityToCreate: {
        [labelIdentifierFieldMetadataUniversalIdentifier]: makeCallerField(
          labelIdentifierFieldMetadataUniversalIdentifier,
          'name',
        ),
        [callerFieldUniversalIdentifier]: makeCallerField(
          callerFieldUniversalIdentifier,
          'amount',
        ),
      },
      flatEntityToUpdate: {},
      flatEntityToDelete: {},
    },
  };

describe('computeInitialObjectViewFieldsToCreate', () => {
  it('should include caller fields from the same batch, label identifier first', () => {
    const initialViewFields = computeInitialObjectViewFieldsToCreate({
      sourceFlatObjectMetadata,
      initialViewUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
    });

    const fieldUniversalIdentifiers = initialViewFields.map(
      (initialViewField) => initialViewField.fieldMetadataUniversalIdentifier,
    );

    expect(fieldUniversalIdentifiers).toContain(callerFieldUniversalIdentifier);
    expect(
      initialViewFields.find(
        (initialViewField) => initialViewField.position === 0,
      )?.fieldMetadataUniversalIdentifier,
    ).toBe(labelIdentifierFieldMetadataUniversalIdentifier);
  });

  it('should include system fields alongside caller fields', () => {
    const initialViewFields = computeInitialObjectViewFieldsToCreate({
      sourceFlatObjectMetadata,
      initialViewUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
    });

    expect(initialViewFields.length).toBeGreaterThan(2);
  });

  it('should emit user-owned view fields keyed under the object application', () => {
    const initialViewFields = computeInitialObjectViewFieldsToCreate({
      sourceFlatObjectMetadata,
      initialViewUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
    });

    for (const initialViewField of initialViewFields) {
      expect(initialViewField.isSystemSideEffect).toBe(false);
      expect(initialViewField.viewUniversalIdentifier).toBe(
        initialViewUniversalIdentifier,
      );
      expect(initialViewField.universalIdentifier).toBe(
        getViewFieldUniversalIdentifier({
          applicationUniversalIdentifier,
          viewUniversalIdentifier: initialViewUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            initialViewField.fieldMetadataUniversalIdentifier,
        }),
      );
    }
  });
});
