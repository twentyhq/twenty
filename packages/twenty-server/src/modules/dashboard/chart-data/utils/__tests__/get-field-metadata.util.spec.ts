import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataOptionMock } from 'src/engine/metadata-modules/flat-field-metadata-option/__mocks__/get-flat-field-metadata-option.mock';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFieldMetadata } from 'src/modules/dashboard/chart-data/utils/get-field-metadata.util';

const OPTION_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000101';

describe('getFieldMetadata', () => {
  it('should return the field with the options of its option rows', () => {
    const fieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: '20202020-0000-4000-8000-000000000201',
      objectMetadataId: '20202020-0000-4000-8000-000000000301',
      type: FieldMetadataType.SELECT,
      options: [
        {
          id: OPTION_UNIVERSAL_IDENTIFIER,
          value: 'ACTIVE',
          label: 'Active',
          color: 'green',
          position: 0,
        },
      ],
      fieldMetadataOptionUniversalIdentifiers: [OPTION_UNIVERSAL_IDENTIFIER],
    });

    const result = getFieldMetadata(
      fieldMetadata.id,
      {
        ...createEmptyFlatEntityMaps(),
        byUniversalIdentifier: {
          [fieldMetadata.universalIdentifier]: fieldMetadata,
        },
        universalIdentifierById: {
          [fieldMetadata.id]: fieldMetadata.universalIdentifier,
        },
      },
      {
        ...createEmptyFlatEntityMaps(),
        byUniversalIdentifier: {
          [OPTION_UNIVERSAL_IDENTIFIER]: getFlatFieldMetadataOptionMock({
            universalIdentifier: OPTION_UNIVERSAL_IDENTIFIER,
            value: 'ACTIVE',
            label: 'Renamed',
            color: 'green',
            position: 0,
          }),
        },
      },
    );

    expect(result.options).toEqual([
      {
        id: OPTION_UNIVERSAL_IDENTIFIER,
        value: 'ACTIVE',
        label: 'Renamed',
        color: 'green',
        position: 0,
      },
    ]);
  });
});
