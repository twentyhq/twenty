import { type ObjectRecord } from 'twenty-shared/types';

import {
  buildConflictKey,
  matchEntitiesForUpsert,
  partitionEntitiesForSave,
} from 'src/engine/twenty-orm-v2/repository/utils/resolve-save-and-upsert.util';

describe('resolve-save-and-upsert util', () => {
  describe('partitionEntitiesForSave', () => {
    it('updates entities with an existing id and inserts the rest', () => {
      const entities = [
        { id: 'existing', name: 'A' },
        { id: 'missing', name: 'B' },
        { name: 'C' },
      ];

      const { toUpdate, toInsert } = partitionEntitiesForSave(
        entities,
        new Set(['existing']),
      );

      expect(toUpdate).toEqual([{ id: 'existing', name: 'A' }]);
      expect(toInsert).toEqual([{ id: 'missing', name: 'B' }, { name: 'C' }]);
    });
  });

  describe('buildConflictKey', () => {
    it('is stable across entities with the same conflict values', () => {
      expect(
        buildConflictKey({ email: 'a', tenant: 't' }, ['email', 'tenant']),
      ).toBe(
        buildConflictKey({ email: 'a', tenant: 't', other: 'x' }, [
          'email',
          'tenant',
        ]),
      );
    });
  });

  describe('matchEntitiesForUpsert', () => {
    it('routes matches to update by existing id and the rest to insert', () => {
      const entities = [
        { email: 'a@twenty.com', name: 'A' },
        { email: 'b@twenty.com', name: 'B' },
      ];
      const existing = [
        { id: 'existing-a', email: 'a@twenty.com' },
      ] as ObjectRecord[];

      const { toUpdate, toInsert } = matchEntitiesForUpsert(
        entities,
        existing,
        ['email'],
      );

      expect(toUpdate).toEqual([
        { id: 'existing-a', entity: { email: 'a@twenty.com', name: 'A' } },
      ]);
      expect(toInsert).toEqual([{ email: 'b@twenty.com', name: 'B' }]);
    });

    it('routes entities with a null conflict value to insert (NULL never conflicts)', () => {
      const entities = [{ email: null, name: 'A' }];
      const existing = [{ id: 'existing', email: null }] as ObjectRecord[];

      const { toUpdate, toInsert } = matchEntitiesForUpsert(
        entities,
        existing,
        ['email'],
      );

      expect(toUpdate).toEqual([]);
      expect(toInsert).toEqual([{ email: null, name: 'A' }]);
    });
  });
});
