import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { findFieldMetadataOptionRowMismatches } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/find-field-metadata-option-row-mismatches.util';

const FIELD_ID = '20202020-0000-4000-8000-000000000001';
const OPEN_OPTION_ID = '20202020-0000-4000-8000-000000000101';
const CLOSED_OPTION_ID = '20202020-0000-4000-8000-000000000102';
const STRAY_OPTION_ID = '20202020-0000-4000-8000-000000000103';

const openOption = {
  id: OPEN_OPTION_ID,
  value: 'OPEN',
  label: 'Open',
  color: 'green',
  position: 0,
} as const;
const closedOption = {
  id: CLOSED_OPTION_ID,
  value: 'CLOSED',
  label: 'Closed',
  color: 'red',
  position: 1,
} as const;

const flatFieldMetadata = getFlatFieldMetadataMock({
  id: FIELD_ID,
  universalIdentifier: FIELD_ID,
  objectMetadataId: '20202020-0000-4000-8000-000000000010',
  type: FieldMetadataType.SELECT,
  options: [openOption, closedOption],
});

const toRow = ({
  id,
  ...columns
}: typeof openOption | typeof closedOption) => ({
  universalIdentifier: id,
  ...columns,
});

describe('findFieldMetadataOptionRowMismatches', () => {
  it('finds nothing when every option has its row', () => {
    expect(
      findFieldMetadataOptionRowMismatches({
        flatFieldMetadata,
        flatFieldMetadataOptions: [toRow(openOption), toRow(closedOption)],
      }),
    ).toEqual([]);
  });

  it('reports missing, different and unexpected rows', () => {
    expect(
      findFieldMetadataOptionRowMismatches({
        flatFieldMetadata,
        flatFieldMetadataOptions: [
          { ...toRow(openOption), label: 'Opened' },
          { ...toRow(closedOption), universalIdentifier: STRAY_OPTION_ID },
        ],
      }),
    ).toEqual([
      {
        fieldMetadataId: FIELD_ID,
        optionUniversalIdentifier: OPEN_OPTION_ID,
        reason: 'different-columns',
      },
      {
        fieldMetadataId: FIELD_ID,
        optionUniversalIdentifier: CLOSED_OPTION_ID,
        reason: 'missing-row',
      },
      {
        fieldMetadataId: FIELD_ID,
        optionUniversalIdentifier: STRAY_OPTION_ID,
        reason: 'unexpected-row',
      },
    ]);
  });
});
