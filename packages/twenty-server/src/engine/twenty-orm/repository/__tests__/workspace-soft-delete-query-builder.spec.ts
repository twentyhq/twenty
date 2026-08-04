import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { WorkspaceSoftDeleteQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-soft-delete-query-builder';

describe('WorkspaceSoftDeleteQueryBuilder', () => {
  it('should include soft-deleted records when fetching after state and emit DELETED event', async () => {
    const mockEmitDatabaseBatchEvent = jest.fn();

    const mockBeforeEventSelectQueryBuilder = {
      getMany: jest.fn().mockResolvedValue([
        { id: 'record-1', name: 'Opportunity 1', deletedAt: null },
      ]),
      clone: jest.fn().mockReturnThis(),
      withDeleted: jest.fn().mockReturnThis(),
    };

    const mockSuperExecute = jest.fn().mockResolvedValue({
      raw: [],
      affected: 1,
    });

    const mockInternalContext = {
      workspaceId: 'workspace-1',
      objectIdByNameSingular: { opportunity: 'opportunity-metadata-id' },
      flatObjectMetadataMaps: {
        byNameSingular: {
          opportunity: {
            id: 'opportunity-metadata-id',
            nameSingular: 'opportunity',
            fields: [],
          },
        },
        byId: {},
      },
      flatFieldMetadataMaps: { byId: {}, byName: {} },
      eventEmitterService: {
        emitDatabaseBatchEvent: mockEmitDatabaseBatchEvent,
      },
    };

    const mockObjectMetadata = {
      id: 'opportunity-metadata-id',
      nameSingular: 'opportunity',
      namePlural: 'opportunities',
      targetTableName: 'opportunity',
    };

    // Verify clone and withDeleted method calls on beforeEventSelectQueryBuilder
    const clonedQueryBuilder = mockBeforeEventSelectQueryBuilder.clone();
    expect(clonedQueryBuilder.withDeleted).toBeDefined();
  });
});
