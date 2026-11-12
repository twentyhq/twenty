import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type UnreadableFieldsOnMatchingRecords } from 'src/engine/permissions/internal/field-access/types/unreadable-fields-on-matching-records.type';
import { findUneditableFieldMetadataIdsOnRecord } from 'src/engine/permissions/internal/field-access/utils/find-uneditable-field-metadata-ids-on-record.util';
import { findUnreadableFieldMetadataIdsOnRecords } from 'src/engine/permissions/internal/field-access/utils/find-unreadable-field-metadata-ids-on-records.util';

const OBJECT_METADATA_ID = 'invoice-object-id';

const invoice = getFlatObjectMetadataMock({
  id: OBJECT_METADATA_ID,
  universalIdentifier: OBJECT_METADATA_ID,
  fieldIds: ['name-field-id', 'status-field-id'],
});

const flatFieldMetadataMaps = [
  { id: 'name-field-id', name: 'name' },
  { id: 'status-field-id', name: 'status' },
].reduce(
  (maps, { id, name }) =>
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: getFlatFieldMetadataMock({
        id,
        universalIdentifier: id,
        objectMetadataId: OBJECT_METADATA_ID,
        type: FieldMetadataType.TEXT,
        name,
      }),
      flatEntityMaps: maps,
    }),
  createEmptyFlatEntityMaps(),
);

const MATCHING_BY_NAME = { name: { eq: 'invoice' } };
const MATCHING_BY_STATUS = { status: { eq: 'open' } };
const NOT_MATCHING = { name: { eq: 'another invoice' } };

const findUnreadable = (
  unreadableFieldsOnMatchingRecords: UnreadableFieldsOnMatchingRecords[],
) =>
  [
    ...findUnreadableFieldMetadataIdsOnRecords({
      flatObjectMetadata: invoice,
      flatFieldMetadataMaps,
      objectUnreadableFieldMetadataIds: ['object-level-field-id'],
      records: [{ name: 'invoice', status: 'open' }],
      unreadableFieldsOnMatchingRecords,
    }),
  ].sort();

describe('findUnreadableFieldMetadataIdsOnRecords', () => {
  it('should hide the fields of the only rule matching the record', () => {
    expect(
      findUnreadable([
        {
          fieldMetadataIds: ['secret-field-id'],
          recordFilter: MATCHING_BY_NAME,
        },
        { fieldMetadataIds: [], recordFilter: NOT_MATCHING },
      ]),
    ).toEqual(['object-level-field-id', 'secret-field-id']);
  });

  it('should show a field as soon as one matching rule leaves it visible', () => {
    expect(
      findUnreadable([
        {
          fieldMetadataIds: ['secret-field-id'],
          recordFilter: MATCHING_BY_NAME,
        },
        { fieldMetadataIds: [], recordFilter: MATCHING_BY_STATUS },
      ]),
    ).toEqual(['object-level-field-id']);
  });

  it('should hide only the fields every matching rule hides', () => {
    expect(
      findUnreadable([
        {
          fieldMetadataIds: ['secret-field-id', 'amount-field-id'],
          recordFilter: MATCHING_BY_NAME,
        },
        {
          fieldMetadataIds: ['secret-field-id'],
          recordFilter: MATCHING_BY_STATUS,
        },
      ]),
    ).toEqual(['object-level-field-id', 'secret-field-id']);
  });

  it('should keep the object level fields when no rule matches the record', () => {
    expect(
      findUnreadable([
        { fieldMetadataIds: ['secret-field-id'], recordFilter: NOT_MATCHING },
      ]),
    ).toEqual(['object-level-field-id']);
  });
});

describe('findUneditableFieldMetadataIdsOnRecord', () => {
  it('should return only the fields every matching rule lists', () => {
    expect([
      ...findUneditableFieldMetadataIdsOnRecord({
        flatObjectMetadata: invoice,
        flatFieldMetadataMaps,
        record: { name: 'invoice', status: 'open' },
        uneditableFieldsOnMatchingRecords: [
          {
            fieldMetadataIds: ['secret-field-id', 'amount-field-id'],
            recordFilter: MATCHING_BY_NAME,
          },
          {
            fieldMetadataIds: ['secret-field-id'],
            recordFilter: MATCHING_BY_STATUS,
          },
          { fieldMetadataIds: [], recordFilter: NOT_MATCHING },
        ],
      }),
    ]).toEqual(['secret-field-id']);
  });
});
