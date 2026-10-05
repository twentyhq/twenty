import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { RecordPermissionsResolver } from 'src/engine/metadata-modules/record-permissions/record-permissions.resolver';

const denied = {
  canRead: false,
  canUpdate: false,
  canDelete: false,
  canSoftDelete: false,
};
const readable = { ...denied, canRead: true };
const buildResolver = () => {
  const objectMetadata = {
    id: 'object',
    universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    readability: MetadataReadability.PRIVATE,
  };
  const recordPermissionsService = {
    getPermissionsForRecords: jest
      .fn()
      .mockResolvedValue(new Map([['record', readable]])),
  };
  const cache = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatObjectMetadataMaps: {
        universalIdentifierById: {
          object: objectMetadata.universalIdentifier,
          secondObject: 'second',
        },
        byUniversalIdentifier: {
          [objectMetadata.universalIdentifier]: objectMetadata,
          second: {
            id: 'secondObject',
            universalIdentifier: 'second',
            readability: MetadataReadability.OPEN,
          },
        },
      },
    }),
  };
  const resolver = new RecordPermissionsResolver(
    recordPermissionsService as never,
    cache as never,
  );
  const query = (
    targets: { objectMetadataId: string; recordId: string }[],
    type = 'user',
  ) =>
    workspaceAuthContextStorage.run(
      {
        type,
        workspace: { id: 'workspace' },
        userWorkspaceId: 'viewer',
      } as never,
      () => resolver.recordPermissions(targets),
    );
  return { query, recordPermissionsService, cache, objectMetadata };
};

describe('Generic record permissions query', () => {
  it('deduplicates and batches by object using the authenticated viewer and existing policy', async () => {
    const { query, recordPermissionsService, objectMetadata } = buildResolver();
    const target = { objectMetadataId: 'object', recordId: 'record' };
    const result = await query([
      target,
      target,
      { ...target, recordId: 'missing' },
      { objectMetadataId: 'secondObject', recordId: 'record' },
    ]);
    expect(result).toEqual([
      { ...target, permissions: readable },
      { ...target, recordId: 'missing', permissions: denied },
      {
        objectMetadataId: 'secondObject',
        recordId: 'record',
        permissions: readable,
      },
    ]);
    expect(
      recordPermissionsService.getPermissionsForRecords,
    ).toHaveBeenCalledTimes(2);
    expect(
      recordPermissionsService.getPermissionsForRecords,
    ).toHaveBeenCalledWith({
      authContext: {
        type: 'user',
        workspace: { id: 'workspace' },
        userWorkspaceId: 'viewer',
      },
      flatObjectMetadata: objectMetadata,
      recordIds: ['record', 'missing'],
    });
  });

  it('does not disclose missing or foreign workspace objects', async () => {
    const { query, recordPermissionsService } = buildResolver();
    const target = { objectMetadataId: 'foreign', recordId: 'record' };
    expect(await query([target])).toEqual([{ ...target, permissions: denied }]);
    expect(
      recordPermissionsService.getPermissionsForRecords,
    ).not.toHaveBeenCalled();
  });

  it('uses the common policy even for SYSTEM chat metadata', async () => {
    const { query, recordPermissionsService, objectMetadata } = buildResolver();
    objectMetadata.readability = MetadataReadability.SYSTEM;
    recordPermissionsService.getPermissionsForRecords.mockResolvedValue(
      new Map(),
    );
    const target = { objectMetadataId: 'object', recordId: 'record' };
    expect(await query([target])).toEqual([{ ...target, permissions: denied }]);
    expect(
      recordPermissionsService.getPermissionsForRecords,
    ).toHaveBeenCalledTimes(1);
  });

  it('rejects oversized batches before reading metadata', async () => {
    const { query, cache } = buildResolver();
    await expect(
      query(
        Array.from({ length: 101 }, () => ({
          objectMetadataId: 'object',
          recordId: 'record',
        })),
      ),
    ).rejects.toThrow('Too many permission targets');
    expect(cache.getOrRecompute).not.toHaveBeenCalled();
  });

  it('requires a user context and does not permit API key impersonation', async () => {
    const { query, cache } = buildResolver();
    await expect(query([], 'apiKey')).rejects.toThrow(
      'User authentication required',
    );
    expect(cache.getOrRecompute).not.toHaveBeenCalled();
  });

  it('skips empty requests', async () => {
    const { query, cache } = buildResolver();
    expect(await query([])).toEqual([]);
    expect(cache.getOrRecompute).not.toHaveBeenCalled();
  });
});
