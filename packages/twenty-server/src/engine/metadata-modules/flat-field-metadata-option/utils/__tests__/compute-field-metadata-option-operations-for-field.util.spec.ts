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

const closedOptionRow: UniversalFlatFieldMetadataOption = {
  ...openOptionRow,
  universalIdentifier: CLOSED_OPTION_ID,
  value: 'CLOSED',
  label: 'Closed',
  color: 'red',
  position: 1,
};

const computeOperations = ({
  existingOptions,
  applicationUniversalIdentifier,
  targetUniversalFlatFieldMetadata = targetField,
}: {
  existingOptions: UniversalFlatFieldMetadataOption[];
  applicationUniversalIdentifier: string;
  targetUniversalFlatFieldMetadata?: typeof targetField;
}) =>
  computeFieldMetadataOptionOperationsForField({
    targetUniversalFlatFieldMetadata,
    existingOptions,
    applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier:
      CALLER_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

const editedTargetField = getFlatFieldMetadataMock({
  ...targetField,
  options: [
    {
      id: CLOSED_OPTION_ID,
      value: 'CLOSED',
      label: 'Done',
      color: 'blue',
      position: 0,
    },
    {
      id: OPEN_OPTION_ID,
      value: 'OPEN',
      label: 'Open',
      color: 'green',
      position: 1,
      isActive: false,
    },
  ],
});

describe('computeFieldMetadataOptionOperationsForField', () => {
  it("creates rows on another app's field that has none", () => {
    const operations = computeOperations({
      existingOptions: [],
      applicationUniversalIdentifier: CALLER_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(Object.keys(operations.flatEntityToCreate).sort()).toEqual([
      OPEN_OPTION_ID,
      CLOSED_OPTION_ID,
    ]);
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

  it("stores a workspace edit of another app's rows as overrides", () => {
    const operations = computeOperations({
      existingOptions: [openOptionRow, closedOptionRow],
      applicationUniversalIdentifier: CALLER_APPLICATION_UNIVERSAL_IDENTIFIER,
      targetUniversalFlatFieldMetadata: editedTargetField,
    });

    expect(operations.flatEntityToDelete).toEqual({});
    expect(operations.flatEntityToCreate).toEqual({});
    expect(operations.flatEntityToUpdate).toMatchObject({
      [OPEN_OPTION_ID]: {
        label: 'Open',
        position: 0,
        isActive: true,
        overrides: {
          [CALLER_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            position: 1,
            isActive: false,
          },
        },
      },
      [CLOSED_OPTION_ID]: {
        label: 'Closed',
        color: 'red',
        position: 1,
        overrides: {
          [CALLER_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            label: 'Done',
            color: 'blue',
            position: 0,
          },
        },
      },
    });
  });

  it("does not override another app's position re-indexed on read from a shared position", () => {
    const workspaceOptionId = '20202020-0000-4000-8000-000000000100';
    const workspaceOptionRow = {
      ...closedOptionRow,
      universalIdentifier: workspaceOptionId,
      applicationUniversalIdentifier: CALLER_APPLICATION_UNIVERSAL_IDENTIFIER,
      value: 'PENDING',
      label: 'Pending',
    };

    const operations = computeOperations({
      existingOptions: [openOptionRow, closedOptionRow, workspaceOptionRow],
      applicationUniversalIdentifier: CALLER_APPLICATION_UNIVERSAL_IDENTIFIER,
      targetUniversalFlatFieldMetadata: getFlatFieldMetadataMock({
        ...targetField,
        options: [
          {
            id: OPEN_OPTION_ID,
            value: 'OPEN',
            label: 'Open',
            color: 'green',
            position: 0,
          },
          {
            id: workspaceOptionId,
            value: 'PENDING',
            label: 'Waiting',
            color: 'red',
            position: 1,
          },
          {
            id: CLOSED_OPTION_ID,
            value: 'CLOSED',
            label: 'Done',
            color: 'red',
            position: 2,
          },
        ],
      }),
    });

    expect(operations.flatEntityToUpdate).toMatchObject({
      [workspaceOptionId]: { label: 'Waiting', position: 1 },
      [CLOSED_OPTION_ID]: {
        position: 1,
        overrides: {
          [CALLER_APPLICATION_UNIVERSAL_IDENTIFIER]: { label: 'Done' },
        },
      },
    });
    expect(
      operations.flatEntityToUpdate[CLOSED_OPTION_ID]?.overrides?.[
        CALLER_APPLICATION_UNIVERSAL_IDENTIFIER
      ],
    ).not.toHaveProperty('position');
    expect(operations.flatEntityToUpdate).not.toHaveProperty(OPEN_OPTION_ID);
  });

  it('drops the overrides once the workspace is back on the app values', () => {
    const operations = computeOperations({
      existingOptions: [
        openOptionRow,
        {
          ...closedOptionRow,
          overrides: {
            [CALLER_APPLICATION_UNIVERSAL_IDENTIFIER]: { label: 'Done' },
          },
        },
      ],
      applicationUniversalIdentifier: CALLER_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(operations.flatEntityToUpdate).toMatchObject({
      [CLOSED_OPTION_ID]: { label: 'Closed', overrides: null },
    });
    expect(Object.keys(operations.flatEntityToUpdate)).toEqual([
      CLOSED_OPTION_ID,
    ]);
  });

  it("writes the owning app's edit to the row itself", () => {
    const operations = computeOperations({
      existingOptions: [openOptionRow, closedOptionRow],
      applicationUniversalIdentifier: FIELD_APPLICATION_UNIVERSAL_IDENTIFIER,
      targetUniversalFlatFieldMetadata: editedTargetField,
    });

    expect(operations.flatEntityToUpdate).toMatchObject({
      [OPEN_OPTION_ID]: { position: 1, isActive: false, overrides: null },
      [CLOSED_OPTION_ID]: {
        label: 'Done',
        color: 'blue',
        position: 0,
        overrides: null,
      },
    });
  });
  it("writes the owning app's edit even when a workspace override already matches it", () => {
    const closedOptionRowWithOverride = {
      ...closedOptionRow,
      overrides: {
        [CALLER_APPLICATION_UNIVERSAL_IDENTIFIER]: { label: 'Done' },
      },
    };

    const operations = computeOperations({
      existingOptions: [openOptionRow, closedOptionRowWithOverride],
      applicationUniversalIdentifier: FIELD_APPLICATION_UNIVERSAL_IDENTIFIER,
      targetUniversalFlatFieldMetadata: {
        ...targetField,
        options: targetField.options?.map((option) =>
          option.id === CLOSED_OPTION_ID
            ? { ...option, label: 'Done' }
            : option,
        ),
      } as typeof targetField,
    });

    expect(operations.flatEntityToUpdate).toMatchObject({
      [CLOSED_OPTION_ID]: { label: 'Done' },
    });
    expect(Object.keys(operations.flatEntityToUpdate)).toEqual([
      CLOSED_OPTION_ID,
    ]);
  });

  it("leaves a row alone when its owning app's values are unchanged under a workspace override", () => {
    const operations = computeOperations({
      existingOptions: [
        openOptionRow,
        {
          ...closedOptionRow,
          overrides: {
            [CALLER_APPLICATION_UNIVERSAL_IDENTIFIER]: { label: 'Done' },
          },
        },
      ],
      applicationUniversalIdentifier: FIELD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(operations.flatEntityToUpdate).toEqual({});
  });
});
