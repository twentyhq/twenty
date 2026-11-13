import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { isMessageReadStateProvisioned } from 'src/modules/messaging/common/utils/is-message-read-state-provisioned.util';

const IS_READ_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.isRead
    .universalIdentifier;

const buildWorkspaceCacheService = (
  byUniversalIdentifier: Record<string, unknown>,
) => ({
  getOrRecompute: jest
    .fn()
    .mockResolvedValue({ flatFieldMetadataMaps: { byUniversalIdentifier } }),
});

describe('isMessageReadStateProvisioned', () => {
  it('is true once the workspace has the isRead field', async () => {
    expect(
      await isMessageReadStateProvisioned({
        workspaceCacheService: buildWorkspaceCacheService({
          [IS_READ_FIELD_UNIVERSAL_IDENTIFIER]: {},
        }),
        workspaceId: 'workspace-id',
      }),
    ).toBe(true);
  });

  it('is false while the upgrade command has not reached the workspace', async () => {
    expect(
      await isMessageReadStateProvisioned({
        workspaceCacheService: buildWorkspaceCacheService({}),
        workspaceId: 'workspace-id',
      }),
    ).toBe(false);
  });
});
