import { type ObjectRecord } from 'twenty-shared/types';

import {
  attachToManyRelationToRecords,
  attachToOneRelationToRecords,
  collectForeignKeys,
  collectRecordIds,
} from 'src/engine/twenty-orm-v2/repository/utils/attach-relations.util';

const asRecords = (records: Record<string, unknown>[]): ObjectRecord[] =>
  records as ObjectRecord[];

describe('attach-relations util', () => {
  describe('collectForeignKeys', () => {
    it('returns unique non-empty foreign keys', () => {
      const records = asRecords([
        { id: '1', companyId: 'c1' },
        { id: '2', companyId: 'c1' },
        { id: '3', companyId: 'c2' },
        { id: '4', companyId: null },
      ]);

      expect(collectForeignKeys(records, 'companyId')).toEqual(['c1', 'c2']);
    });
  });

  describe('collectRecordIds', () => {
    it('returns unique ids', () => {
      const records = asRecords([{ id: 'a' }, { id: 'a' }, { id: 'b' }]);

      expect(collectRecordIds(records)).toEqual(['a', 'b']);
    });
  });

  describe('attachToOneRelationToRecords', () => {
    it('attaches the matching target or null', () => {
      const records = asRecords([
        { id: '1', companyId: 'c1' },
        { id: '2', companyId: 'c2' },
        { id: '3', companyId: null },
      ]);
      const targets = asRecords([{ id: 'c1', name: 'Twenty' }]);

      attachToOneRelationToRecords({
        records,
        fieldName: 'company',
        joinColumnName: 'companyId',
        targets,
      });

      expect(records[0].company).toEqual({ id: 'c1', name: 'Twenty' });
      expect(records[1].company).toBeNull();
      expect(records[2].company).toBeNull();
    });
  });

  describe('attachToManyRelationToRecords', () => {
    it('groups children under each parent and defaults to an empty array', () => {
      const records = asRecords([{ id: 'c1' }, { id: 'c2' }]);
      const children = asRecords([
        { id: 'p1', companyId: 'c1' },
        { id: 'p2', companyId: 'c1' },
        { id: 'p3', companyId: 'cX' },
      ]);

      attachToManyRelationToRecords({
        records,
        fieldName: 'people',
        inverseForeignKeyColumnName: 'companyId',
        children,
      });

      expect(records[0].people).toEqual([
        { id: 'p1', companyId: 'c1' },
        { id: 'p2', companyId: 'c1' },
      ]);
      expect(records[1].people).toEqual([]);
    });
  });
});
