import { CreateIndexActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/index/services/create-index-action-handler.service';

describe('CreateIndexActionHandlerService', () => {
  let service: CreateIndexActionHandlerService;

  beforeEach(() => {
    service = new CreateIndexActionHandlerService(null as any);
  });

  describe('computeWhereClauseForUniqueIndex', () => {
    it('should return existing where clause if provided', () => {
      const result = (service as any).computeWhereClauseForUniqueIndex({
        isUnique: true,
        existingWhereClause: '"deletedAt" IS NULL',
        columns: ['emailsPrimaryEmail'],
      });

      expect(result).toBe('"deletedAt" IS NULL');
    });

    it('should return undefined for non-unique indexes', () => {
      const result = (service as any).computeWhereClauseForUniqueIndex({
        isUnique: false,
        existingWhereClause: null,
        columns: ['emailsPrimaryEmail'],
      });

      expect(result).toBeUndefined();
    });

    it('should generate WHERE clause excluding empty strings for unique indexes', () => {
      const result = (service as any).computeWhereClauseForUniqueIndex({
        isUnique: true,
        existingWhereClause: null,
        columns: ['emailsPrimaryEmail'],
      });

      expect(result).toBe(
        '"emailsPrimaryEmail" IS NOT NULL AND "emailsPrimaryEmail" <> \'\'',
      );
    });

    it('should generate WHERE clause for multiple columns', () => {
      const result = (service as any).computeWhereClauseForUniqueIndex({
        isUnique: true,
        existingWhereClause: null,
        columns: ['nameFirstName', 'nameLastName'],
      });

      expect(result).toBe(
        '"nameFirstName" IS NOT NULL AND "nameFirstName" <> \'\' AND "nameLastName" IS NOT NULL AND "nameLastName" <> \'\'',
      );
    });
  });
});
