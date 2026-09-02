import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import {
  ConnectedAccountException,
  ConnectedAccountExceptionCode,
} from 'src/engine/metadata-modules/connected-account/connected-account.exception';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

const USER_WORKSPACE_ID = '20202020-2222-4222-8222-222222222222';
const OTHER_USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';
const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const ACCOUNT_ID = '20202020-4444-4444-8444-444444444444';

describe('ConnectedAccountMetadataService', () => {
  const repository = { findOne: jest.fn() };
  const service = new ConnectedAccountMetadataService(
    repository as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('verifyDestructiveOwnership', () => {
    it('throws CONNECTED_ACCOUNT_NOT_FOUND when the account does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.verifyDestructiveOwnership({
          id: ACCOUNT_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
      });
    });

    it('lets the owner delete a workspace-shared account', async () => {
      const account = {
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        visibility: 'workspace',
      } as ConnectedAccountEntity;
      repository.findOne.mockResolvedValue(account);

      await expect(
        service.verifyDestructiveOwnership({
          id: ACCOUNT_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
          workspaceId: WORKSPACE_ID,
        }),
      ).resolves.toBe(account);
    });

    it('blocks any other workspace member from deleting a workspace-shared account', async () => {
      // Regression for #25228: verifyOwnership (usable-by-caller) passes here
      // by design - destructive actions must not use it.
      repository.findOne.mockResolvedValue({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: OTHER_USER_WORKSPACE_ID,
        visibility: 'workspace',
      } as ConnectedAccountEntity);

      await expect(
        service.verifyDestructiveOwnership({
          id: ACCOUNT_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_OWNERSHIP_VIOLATION,
      });
    });

    it('blocks deleting another member private account', async () => {
      repository.findOne.mockResolvedValue({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: OTHER_USER_WORKSPACE_ID,
        visibility: 'user',
      } as ConnectedAccountEntity);

      await expect(
        service.verifyDestructiveOwnership({
          id: ACCOUNT_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toBeInstanceOf(ConnectedAccountException);
    });
  });
});
