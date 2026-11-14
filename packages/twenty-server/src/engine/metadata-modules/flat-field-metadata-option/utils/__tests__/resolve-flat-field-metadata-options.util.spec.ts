import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataOptionMock } from 'src/engine/metadata-modules/flat-field-metadata-option/__mocks__/get-flat-field-metadata-option.mock';
import { resolveFlatFieldMetadataOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';

const OPEN_OPTION_ID = '20202020-0000-4000-8000-000000000101';
const CLOSED_OPTION_ID = '20202020-0000-4000-8000-000000000102';

const flatFieldMetadataOptionMaps = {
  byUniversalIdentifier: {
    [OPEN_OPTION_ID]: getFlatFieldMetadataOptionMock({
      universalIdentifier: OPEN_OPTION_ID,
      value: 'OPEN',
      label: 'Open',
      position: 0,
    }),
    [CLOSED_OPTION_ID]: getFlatFieldMetadataOptionMock({
      universalIdentifier: CLOSED_OPTION_ID,
      value: 'CLOSED',
      label: 'Closed',
      position: 1,
    }),
  },
};

const storedOpenOption = {
  id: OPEN_OPTION_ID,
  value: 'OPEN',
  label: 'Stored open',
  color: 'green' as const,
  position: 0,
};

describe('resolveFlatFieldMetadataOptions', () => {
  it('reads the options of a field from its option rows', () => {
    expect(
      resolveFlatFieldMetadataOptions({
        flatFieldMetadata: {
          type: FieldMetadataType.SELECT,
          options: [storedOpenOption],
          fieldMetadataOptionUniversalIdentifiers: [
            CLOSED_OPTION_ID,
            OPEN_OPTION_ID,
          ],
        },
        flatFieldMetadataOptionMaps,
      }),
    ).toEqual([
      { id: OPEN_OPTION_ID, value: 'OPEN', label: 'Open', position: 0 },
      { id: CLOSED_OPTION_ID, value: 'CLOSED', label: 'Closed', position: 1 },
    ]);
  });

  it('reads the rows even when a stored option has no row', () => {
    expect(
      resolveFlatFieldMetadataOptions({
        flatFieldMetadata: {
          type: FieldMetadataType.SELECT,
          options: [
            storedOpenOption,
            { id: 'legacy', value: 'LEGACY', label: 'Legacy', position: 1 },
          ],
          fieldMetadataOptionUniversalIdentifiers: [OPEN_OPTION_ID],
        },
        flatFieldMetadataOptionMaps,
      }),
    ).toEqual([
      { id: OPEN_OPTION_ID, value: 'OPEN', label: 'Open', position: 0 },
    ]);
  });

  it('reads the rows of an ORM field, which carries no options', () => {
    expect(
      resolveFlatFieldMetadataOptions({
        flatFieldMetadata: {
          type: FieldMetadataType.SELECT,
          fieldMetadataOptionUniversalIdentifiers: [OPEN_OPTION_ID],
        },
        flatFieldMetadataOptionMaps,
      }),
    ).toEqual([
      { id: OPEN_OPTION_ID, value: 'OPEN', label: 'Open', position: 0 },
    ]);
  });
});
