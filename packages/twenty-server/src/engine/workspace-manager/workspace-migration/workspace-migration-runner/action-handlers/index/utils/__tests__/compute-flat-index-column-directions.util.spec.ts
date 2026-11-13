import { FieldMetadataType, OrderByDirection } from 'twenty-shared/types';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexFieldMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { computeFlatIndexColumnDirections } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';

describe('computeFlatIndexColumnDirections', () => {
  const fields = [
    {
      id: 'occurred-on-id',
      universalIdentifier: 'occurred-on-universal-identifier',
      name: 'occurredOn',
      type: FieldMetadataType.DATE,
    },
    {
      id: 'amount-id',
      universalIdentifier: 'amount-universal-identifier',
      name: 'amount',
      type: FieldMetadataType.CURRENCY,
    },
    {
      id: 'name-id',
      universalIdentifier: 'name-universal-identifier',
      name: 'name',
      type: FieldMetadataType.TEXT,
    },
  ] as FlatFieldMetadata[];

  const flatFieldMetadataMaps = {
    byUniversalIdentifier: Object.fromEntries(
      fields.map((field) => [field.universalIdentifier, field]),
    ),
    universalIdentifierById: Object.fromEntries(
      fields.map((field) => [field.id, field.universalIdentifier]),
    ),
    universalIdentifiersByApplicationId: {},
  } as MetadataFlatEntityMaps<'fieldMetadata'>;

  it('maps each column to its non default direction', () => {
    expect(
      computeFlatIndexColumnDirections({
        flatIndexFieldMetadatas: [
          {
            fieldMetadataId: 'occurred-on-id',
            direction: OrderByDirection.DescNullsLast,
          },
          {
            fieldMetadataId: 'amount-id',
            subFieldName: 'amountMicros',
            direction: OrderByDirection.AscNullsFirst,
          },
        ] as FlatIndexFieldMetadata[],
        flatFieldMetadataMaps,
      }),
    ).toEqual({
      occurredOn: OrderByDirection.DescNullsLast,
      amountAmountMicros: OrderByDirection.AscNullsFirst,
    });
  });

  it('leaves out columns that keep the default direction', () => {
    expect(
      computeFlatIndexColumnDirections({
        flatIndexFieldMetadatas: [
          { fieldMetadataId: 'name-id' },
          { fieldMetadataId: 'occurred-on-id', direction: null },
          {
            fieldMetadataId: 'amount-id',
            subFieldName: 'amountMicros',
            direction: OrderByDirection.AscNullsLast,
          },
        ] as FlatIndexFieldMetadata[],
        flatFieldMetadataMaps,
      }),
    ).toEqual({});
  });
});
