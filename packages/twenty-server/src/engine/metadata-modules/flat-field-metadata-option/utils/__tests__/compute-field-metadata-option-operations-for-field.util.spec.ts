import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { computeFieldMetadataOptionOperationsForField } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/compute-field-metadata-option-operations-for-field.util';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

const FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const FIELD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000aa';
const CALLER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000bb';
const OPEN_OPTION_ID = '20202020-0000-4000-8000-000000000101';
const CLOSED_OPTION_ID = '20202020-0000-4000-8000-000000000102';

const targetField = getFlatFieldMetadataMock({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  objectMetadataId: '20202020-0000-4000-8000-000000000010',
  type: FieldMetadataType.SELECT,
  applicationUniversalIdentifier: FIELD_APPLICATION_UNIVERSAL_IDENTIFIER,
  options: [
    {
      id: OPEN_OPTION_ID,
      value: 'OPEN',
      label: 'Open',
      color: 'green',
      position: 0,
    },
    {
      id: CLOSED_OPTION_ID,
      value: 'CLOSED',
      label: 'Closed',
      color: 'red',
      position: 1,
    },
  ],
});

const openOptionRow: UniversalFlatFieldMetadataOption = {
  universalIdentifier: OPEN_OPTION_ID,
  applicationUniversalIdentifier: FIELD_APPLICATION_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  value: 'OPEN',
  label: 'Open',
  color: 'green',
  position: 0,
  isActive: true,
  overrides: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const computeOperations = ({
  existingOptions,
  applicationUniversalIdentifier,
}: {
  existingOptions: UniversalFlatFieldMetadataOption[];
  applicationUniversalIdentifier: string;
}) =>
  computeFieldMetadataOptionOperationsForField({
    targetUniversalFlatFieldMetadata: targetField,
    existingOptions,
    isUniversalIdentifierUsedByOtherField: () => false,
    applicationUniversalIdentifier,
  });

describe('computeFieldMetadataOptionOperationsForField', () => {
  it("leaves another app's field without rows to the backfill", () => {
    const operations = computeOperations({
      existingOptions: [],
      applicationUniversalIdentifier: CALLER_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(Object.keys(operations.flatEntityToCreate)).toEqual([]);
  });

  it("creates rows for the caller's own field", () => {
    const operations = computeOperations({
      existingOptions: [],
      applicationUniversalIdentifier: FIELD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(Object.keys(operations.flatEntityToCreate).sort()).toEqual([
      OPEN_OPTION_ID,
      CLOSED_OPTION_ID,
    ]);
  });

  it("creates the missing rows on another app's field that already has rows", () => {
    const operations = computeOperations({
      existingOptions: [openOptionRow],
      applicationUniversalIdentifier: CALLER_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(Object.keys(operations.flatEntityToCreate)).toEqual([
      CLOSED_OPTION_ID,
    ]);
  });
});
