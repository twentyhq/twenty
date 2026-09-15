import { computeUniqueFieldMetadataIdsFromIndexes } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-field-metadata-ids-from-indexes.util';

const FIELD_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const FIELD_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

describe('computeUniqueFieldMetadataIdsFromIndexes', () => {
  it('includes a field backed by a single-column system-side-effect unique index', () => {
    const result = computeUniqueFieldMetadataIdsFromIndexes([
      {
        isUnique: true,
        isSystemSideEffect: true,
        flatIndexFieldMetadatas: [
          { fieldMetadataId: FIELD_A, subFieldName: null },
        ],
      },
    ]);

    expect(result.has(FIELD_A)).toBe(true);
  });

  it('excludes a single-column unique index that is not a system side effect (e.g. a user defineIndex)', () => {
    const result = computeUniqueFieldMetadataIdsFromIndexes([
      {
        isUnique: true,
        isSystemSideEffect: false,
        flatIndexFieldMetadatas: [
          { fieldMetadataId: FIELD_A, subFieldName: null },
        ],
      },
    ]);

    expect(result.has(FIELD_A)).toBe(false);
  });

  it('excludes a non-unique index', () => {
    const result = computeUniqueFieldMetadataIdsFromIndexes([
      {
        isUnique: false,
        isSystemSideEffect: true,
        flatIndexFieldMetadatas: [
          { fieldMetadataId: FIELD_A, subFieldName: null },
        ],
      },
    ]);

    expect(result.has(FIELD_A)).toBe(false);
  });

  it('excludes fields that are part of a multi-column unique index', () => {
    const result = computeUniqueFieldMetadataIdsFromIndexes([
      {
        isUnique: true,
        isSystemSideEffect: true,
        flatIndexFieldMetadatas: [
          { fieldMetadataId: FIELD_A, subFieldName: null },
          { fieldMetadataId: FIELD_B, subFieldName: null },
        ],
      },
    ]);

    expect(result.has(FIELD_A)).toBe(false);
    expect(result.has(FIELD_B)).toBe(false);
  });

  it('excludes a unique index on a composite sub-field', () => {
    const result = computeUniqueFieldMetadataIdsFromIndexes([
      {
        isUnique: true,
        isSystemSideEffect: true,
        flatIndexFieldMetadatas: [
          { fieldMetadataId: FIELD_A, subFieldName: 'primaryLinkUrl' },
        ],
      },
    ]);

    expect(result.has(FIELD_A)).toBe(false);
  });

  it('supports the entity-shaped indexFieldMetadatas key', () => {
    const result = computeUniqueFieldMetadataIdsFromIndexes([
      {
        isUnique: true,
        isSystemSideEffect: true,
        indexFieldMetadatas: [{ fieldMetadataId: FIELD_A, subFieldName: null }],
      },
    ]);

    expect(result.has(FIELD_A)).toBe(true);
  });
});
