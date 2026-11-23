import {
  AggregateOperations,
  type FieldMetadataRollupSettings,
  FieldMetadataType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { fromRollupSettingsToUniversalRollupSettings } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-rollup-settings-to-universal-rollup-settings.util';
import { fromUniversalRollupSettingsToRollupSettingsOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-universal-rollup-settings-to-rollup-settings-or-throw.util';

const SETTINGS: FieldMetadataRollupSettings = {
  relationFieldMetadataId: 'relation-id',
  aggregateOperation: AggregateOperations.SUM,
  aggregatedFieldMetadataId: 'amount-id',
  filters: [
    {
      id: 'filter-id',
      fieldMetadataId: 'stage-id',
      operand: ViewFilterOperand.IS,
      value: 'WON',
    },
  ],
  filterGroups: [],
  resultType: FieldMetadataType.NUMBER,
  decimals: 2,
};

const UNIVERSAL_IDENTIFIER_BY_ID = {
  'relation-id': 'relation-universal-identifier',
  'amount-id': 'amount-universal-identifier',
  'stage-id': 'stage-universal-identifier',
};

const ID_BY_UNIVERSAL_IDENTIFIER: Partial<Record<string, string>> =
  Object.fromEntries(
    Object.entries(UNIVERSAL_IDENTIFIER_BY_ID).map(
      ([id, universalIdentifier]) => [universalIdentifier, id],
    ),
  );

describe('fromRollupSettingsToUniversalRollupSettings', () => {
  it('should replace every field id by its universal identifier', () => {
    expect(
      fromRollupSettingsToUniversalRollupSettings({
        settings: SETTINGS,
        fieldMetadataUniversalIdentifierById: UNIVERSAL_IDENTIFIER_BY_ID,
      }),
    ).toEqual({
      relationFieldMetadataUniversalIdentifier: 'relation-universal-identifier',
      aggregateOperation: AggregateOperations.SUM,
      aggregatedFieldMetadataUniversalIdentifier: 'amount-universal-identifier',
      filters: [
        {
          id: 'filter-id',
          fieldMetadataUniversalIdentifier: 'stage-universal-identifier',
          operand: ViewFilterOperand.IS,
          value: 'WON',
        },
      ],
      filterGroups: [],
      resultType: FieldMetadataType.NUMBER,
      decimals: 2,
    });
  });

  it('should leave a field that no longer exists unresolved', () => {
    const universalSettings = fromRollupSettingsToUniversalRollupSettings({
      settings: SETTINGS,
      fieldMetadataUniversalIdentifierById: {},
    });

    expect(universalSettings).toMatchObject({
      relationFieldMetadataUniversalIdentifier: null,
      aggregatedFieldMetadataUniversalIdentifier: null,
      filters: [{ fieldMetadataUniversalIdentifier: null }],
    });
  });

  it('should round trip through the universal settings', () => {
    const universalSettings = fromRollupSettingsToUniversalRollupSettings({
      settings: SETTINGS,
      fieldMetadataUniversalIdentifierById: UNIVERSAL_IDENTIFIER_BY_ID,
    });

    expect(
      fromUniversalRollupSettingsToRollupSettingsOrThrow({
        universalSettings,
        findFieldMetadataIdByUniversalIdentifier: (universalIdentifier) =>
          ID_BY_UNIVERSAL_IDENTIFIER[universalIdentifier] ?? null,
      }),
    ).toEqual(SETTINGS);
  });
});

describe('fromUniversalRollupSettingsToRollupSettingsOrThrow', () => {
  it('should keep a count without an aggregated field', () => {
    const universalSettings = fromRollupSettingsToUniversalRollupSettings({
      settings: {
        ...SETTINGS,
        aggregateOperation: AggregateOperations.COUNT,
        aggregatedFieldMetadataId: null,
        filters: [],
      },
      fieldMetadataUniversalIdentifierById: UNIVERSAL_IDENTIFIER_BY_ID,
    });

    expect(
      fromUniversalRollupSettingsToRollupSettingsOrThrow({
        universalSettings,
        findFieldMetadataIdByUniversalIdentifier: (universalIdentifier) =>
          ID_BY_UNIVERSAL_IDENTIFIER[universalIdentifier] ?? null,
      }),
    ).toMatchObject({
      relationFieldMetadataId: 'relation-id',
      aggregatedFieldMetadataId: null,
    });
  });

  it('should throw when a referenced field cannot be found', () => {
    const universalSettings = fromRollupSettingsToUniversalRollupSettings({
      settings: SETTINGS,
      fieldMetadataUniversalIdentifierById: UNIVERSAL_IDENTIFIER_BY_ID,
    });

    expect(() =>
      fromUniversalRollupSettingsToRollupSettingsOrThrow({
        universalSettings,
        findFieldMetadataIdByUniversalIdentifier: () => null,
      }),
    ).toThrow('Could not find the field a rollup refers to');
  });
});
