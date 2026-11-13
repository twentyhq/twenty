import { FieldMetadataType } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { FieldMetadataOptionEnumSchemaService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/field-metadata-option-enum-schema.service';

const OPEN_ID = '20202020-0000-4000-8000-000000000101';
const CLOSED_ID = '20202020-0000-4000-8000-000000000102';
const MIDDLE_ID = '20202020-0000-4000-8000-000000000103';

const optionRow = (
  universalIdentifier: string,
  value: string,
  position: number,
) => ({ universalIdentifier, value, label: value, color: null, position });

describe('FieldMetadataOptionEnumSchemaService.applyEnumChange', () => {
  const alterEnumValues = jest.fn();
  const query = jest.fn();
  const service = new FieldMetadataOptionEnumSchemaService({
    enumManager: { alterEnumValues },
  } as unknown as WorkspaceSchemaManagerService);
  const flatObjectMetadata = getFlatObjectMetadataMock({
    universalIdentifier: '20202020-0000-4000-8000-000000000201',
    nameSingular: 'ticket',
  });
  const flatFieldMetadata = getFlatFieldMetadataMock({
    universalIdentifier: '20202020-0000-4000-8000-000000000202',
    objectMetadataId: flatObjectMetadata.id,
    type: FieldMetadataType.SELECT,
    name: 'status',
  });

  const applyEnumChange = ({
    currentEnumValues,
    fromOptionRows,
    toOptionRows,
  }: {
    currentEnumValues: string[];
    fromOptionRows: ReturnType<typeof optionRow>[];
    toOptionRows: ReturnType<typeof optionRow>[];
  }) => {
    query.mockResolvedValue(currentEnumValues.map((value) => ({ value })));

    return service.applyEnumChange({
      enumChange: { fromOptionRows, toOptionRows },
      flatFieldMetadata,
      flatObjectMetadata,
      queryRunner: { query } as unknown as QueryRunner,
      workspaceId: '20202020-0000-4000-8000-000000000203',
    });
  };

  beforeEach(() => {
    alterEnumValues.mockReset();
    query.mockReset();
  });

  it('rebuilds the enum in the new order when options are only reordered', async () => {
    const wasEnumChanged = await applyEnumChange({
      currentEnumValues: ['OPEN', 'CLOSED'],
      fromOptionRows: [
        optionRow(OPEN_ID, 'OPEN', 0),
        optionRow(CLOSED_ID, 'CLOSED', 1),
      ],
      toOptionRows: [
        optionRow(OPEN_ID, 'OPEN', 1),
        optionRow(CLOSED_ID, 'CLOSED', 0),
      ],
    });

    expect(wasEnumChanged).toBe(true);
    expect(alterEnumValues).toHaveBeenCalledWith(
      expect.objectContaining({
        enumValues: ['CLOSED', 'OPEN'],
        oldToNewEnumOptionMap: { OPEN: 'OPEN', CLOSED: 'CLOSED' },
      }),
    );
  });

  it('places an option added in the middle at its position in the enum', async () => {
    await applyEnumChange({
      currentEnumValues: ['OPEN', 'CLOSED'],
      fromOptionRows: [
        optionRow(OPEN_ID, 'OPEN', 0),
        optionRow(CLOSED_ID, 'CLOSED', 2),
      ],
      toOptionRows: [
        optionRow(OPEN_ID, 'OPEN', 0),
        optionRow(CLOSED_ID, 'CLOSED', 2),
        optionRow(MIDDLE_ID, 'MIDDLE', 1),
      ],
    });

    expect(alterEnumValues).toHaveBeenCalledWith(
      expect.objectContaining({ enumValues: ['OPEN', 'MIDDLE', 'CLOSED'] }),
    );
  });

  it('leaves the column alone when the enum already matches the option order', async () => {
    const wasEnumChanged = await applyEnumChange({
      currentEnumValues: ['OPEN', 'CLOSED'],
      fromOptionRows: [
        optionRow(OPEN_ID, 'OPEN', 0),
        optionRow(CLOSED_ID, 'CLOSED', 1),
      ],
      toOptionRows: [
        { ...optionRow(OPEN_ID, 'OPEN', 0), label: 'Renamed' },
        optionRow(CLOSED_ID, 'CLOSED', 1),
      ],
    });

    expect(wasEnumChanged).toBe(false);
    expect(alterEnumValues).not.toHaveBeenCalled();
  });

  it('keeps enum values no option row declares', async () => {
    await applyEnumChange({
      currentEnumValues: ['OPEN', 'CLOSED', 'LEGACY'],
      fromOptionRows: [
        optionRow(OPEN_ID, 'OPEN', 0),
        optionRow(CLOSED_ID, 'CLOSED', 1),
      ],
      toOptionRows: [optionRow(OPEN_ID, 'OPEN', 0)],
    });

    expect(alterEnumValues).toHaveBeenCalledWith(
      expect.objectContaining({
        enumValues: ['OPEN', 'LEGACY'],
        oldToNewEnumOptionMap: { OPEN: 'OPEN', LEGACY: 'LEGACY' },
      }),
    );
  });
});
