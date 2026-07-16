import { DirectusSchemaFingerprinterService } from 'src/modules/executive-search/directus/services/schema-fingerprinter.service';
import type {
  DirectusCollection,
  DirectusField,
} from 'src/modules/executive-search/directus/types/directus-types';

const makeCollection = (
  name: string,
  hidden = false,
  singleton = false,
): DirectusCollection =>
  ({
    collection: name,
    meta: { hidden, singleton },
    schema: { name, comment: null },
  }) as DirectusCollection;

const makeField = (collection: string, field: string): DirectusField =>
  ({
    collection,
    field,
    type: 'string',
    meta: null,
    schema: {
      name: field,
      table: collection,
      dataType: 'varchar',
      isNullable: true,
      isPrimaryKey: false,
      hasAutoIncrement: false,
      isUnique: false,
    },
  }) as unknown as DirectusField;

describe('DirectusSchemaFingerprinterService', () => {
  let service: DirectusSchemaFingerprinterService;

  beforeEach(() => {
    service = new DirectusSchemaFingerprinterService();
  });

  describe('computeCollectionsHash', () => {
    it('should produce deterministic hash regardless of input order', () => {
      const collections = [
        makeCollection('c'),
        makeCollection('a'),
        makeCollection('b'),
      ];

      const reversed = [...collections].reverse();

      const hash1 = service.computeCollectionsHash(collections);
      const hash2 = service.computeCollectionsHash(reversed);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex
    });

    it('should produce different hash for different collections', () => {
      const hash1 = service.computeCollectionsHash([makeCollection('users')]);
      const hash2 = service.computeCollectionsHash([
        makeCollection('users'),
        makeCollection('posts'),
      ]);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('buildFingerprint', () => {
    it('should include hashes, counts, version, and timestamp', () => {
      const collections = [makeCollection('users'), makeCollection('posts')];
      const fields = [
        makeField('users', 'id'),
        makeField('users', 'name'),
        makeField('posts', 'id'),
        makeField('posts', 'title'),
      ];

      const fp = service.buildFingerprint(collections, fields, '10.10.0');

      expect(fp.collectionsHash).toHaveLength(64);
      expect(fp.fieldsHash).toHaveLength(64);
      expect(fp.collectionsCount).toBe(2);
      expect(fp.fieldsCount).toBe(4);
      expect(fp.directusVersion).toBe('10.10.0');
      expect(fp.capturedAt).toBeDefined();
    });
  });

  describe('compare', () => {
    it('should return null when fingerprints match', () => {
      const fp = service.buildFingerprint(
        [makeCollection('users')],
        [makeField('users', 'id')],
        '10.10.0',
      );

      const result = service.compare(fp, { ...fp });

      expect(result).toBeNull();
    });

    it('should detect collection hash drift', () => {
      const fp1 = service.buildFingerprint(
        [makeCollection('users')],
        [],
        '10.10.0',
      );
      const fp2 = service.buildFingerprint(
        [makeCollection('users'), makeCollection('posts')],
        [],
        '10.10.0',
      );

      const result = service.compare(fp1, fp2);

      expect(result).not.toBeNull();
      expect(result!.hasDrift).toBe(true);
      expect(result!.diffs.some((d) => d.includes('Collections changed'))).toBe(
        true,
      );
    });

    it('should detect field count drift', () => {
      const collections = [makeCollection('users')];
      const fp1 = service.buildFingerprint(
        collections,
        [makeField('users', 'id')],
        '10.10.0',
      );
      const fp2 = service.buildFingerprint(
        collections,
        [makeField('users', 'id'), makeField('users', 'name')],
        '10.10.0',
      );

      const result = service.compare(fp1, fp2);

      expect(result).not.toBeNull();
      expect(result!.diffs.some((d) => d.includes('Field count'))).toBe(true);
    });

    it('should detect version drift', () => {
      const collections = [makeCollection('users')];
      const fp1 = service.buildFingerprint(collections, [], '10.10.0');
      const fp2 = service.buildFingerprint(collections, [], '11.0.0');

      const result = service.compare(fp1, fp2);

      expect(result).not.toBeNull();
      expect(result!.diffs.some((d) => d.includes('Directus version'))).toBe(
        true,
      );
    });
  });
});
