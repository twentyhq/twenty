import { FieldMetadataType } from 'twenty-shared/types';

import { copyFormattedFieldValue } from 'src/engine/twenty-orm/utils/copy-formatted-field-value.util';

describe('copyFormattedFieldValue', () => {
  it('should return undefined when value is undefined', () => {
    expect(
      copyFormattedFieldValue({
        value: undefined,
        fieldType: FieldMetadataType.TEXT,
      }),
    ).toBeUndefined();
  });

  it('should return null when value is null', () => {
    expect(
      copyFormattedFieldValue({
        value: null,
        fieldType: FieldMetadataType.TEXT,
      }),
    ).toBeNull();
  });

  it('should return primitives unchanged', () => {
    expect(
      copyFormattedFieldValue({
        value: 'same',
        fieldType: FieldMetadataType.TEXT,
      }),
    ).toBe('same');

    expect(
      copyFormattedFieldValue({
        value: 42,
        fieldType: FieldMetadataType.NUMBER,
      }),
    ).toBe(42);
  });

  it('should deep-clone plain objects for non-large field types so mutations do not alias', () => {
    const inner = { primaryEmail: 'a@b.com' };
    const source = { emails: inner };

    const copy = copyFormattedFieldValue({
      value: source,
      fieldType: FieldMetadataType.EMAILS,
    }) as Record<string, unknown>;

    expect(copy).not.toBe(source);
    expect(copy.emails).not.toBe(inner);
    inner.primaryEmail = 'changed@b.com';
    expect((copy.emails as { primaryEmail: string }).primaryEmail).toBe(
      'a@b.com',
    );
  });

  it('should deep-clone arrays for non-large field types', () => {
    const row = [{ id: '1' }];
    const copy = copyFormattedFieldValue({
      value: row,
      fieldType: FieldMetadataType.ARRAY,
    }) as typeof row;

    expect(copy).not.toBe(row);
    expect(copy[0]).not.toBe(row[0]);
  });

  describe('RAW_JSON and RICH_TEXT (depth-limited clone, max depth 2)', () => {
    const largeString = 'x'.repeat(100_000);

    it('should clone only two structural levels for RAW_JSON and share depth-2+ nodes, including large JSON', () => {
      const deepLargeNode = {
        version: 1,
        payload: largeString,
        nested: { items: Array.from({ length: 100 }, (_, index) => index) },
      };
      const level1 = { inner: deepLargeNode };
      const source = { meta: level1 };

      const copy = copyFormattedFieldValue({
        value: source,
        fieldType: FieldMetadataType.RAW_JSON,
      }) as typeof source;

      expect(copy).not.toBe(source);
      expect(copy.meta).not.toBe(level1);
      expect(copy.meta.inner).toBe(deepLargeNode);
      expect(copy.meta.inner.payload).toBe(largeString);
      expect(copy.meta.inner.nested).toBe(deepLargeNode.nested);

      deepLargeNode.version = 999;
      expect(copy.meta.inner.version).toBe(999);
    });

    it('should clone only two structural levels for RICH_TEXT and share depth-2+ nodes, including large body', () => {
      const prosemirrorLikeBlock = {
        type: 'text',
        text: largeString,
      };
      const paragraph = { type: 'paragraph', content: prosemirrorLikeBlock };
      const doc = { type: 'doc', content: paragraph };
      const source = { richText: doc };

      const copy = copyFormattedFieldValue({
        value: source,
        fieldType: FieldMetadataType.RICH_TEXT,
      }) as typeof source;

      expect(copy).not.toBe(source);
      expect(copy.richText).not.toBe(doc);
      expect(copy.richText.content).toBe(paragraph);
      expect(copy.richText.content.content).toBe(prosemirrorLikeBlock);
      expect(copy.richText.content.content.text).toBe(largeString);
    });

    it('should fully deep-clone the same shape for EMAILS so deep nodes are not shared', () => {
      const deepNode = { body: largeString };
      const level1 = { inner: deepNode };
      const source = { meta: level1 };

      const copy = copyFormattedFieldValue({
        value: source,
        fieldType: FieldMetadataType.EMAILS,
      }) as typeof source;

      expect(copy.meta.inner).not.toBe(deepNode);
      expect(copy.meta.inner.body).toBe(largeString);
    });

    it('should stop at depth 2: depth 0 and 1 are new objects, depth 2 subtree is identical reference', () => {
      const subtreeAtDepth2 = { k: { leaf: 1 } };
      const atDepth1 = { child: subtreeAtDepth2 };
      const source = { root: atDepth1 };

      const copy = copyFormattedFieldValue({
        value: source,
        fieldType: FieldMetadataType.RAW_JSON,
      }) as typeof source;

      expect(copy.root).not.toBe(atDepth1);
      expect(copy.root.child).toBe(subtreeAtDepth2);
      expect(copy.root.child.k).toBe(subtreeAtDepth2.k);
    });
  });
});
