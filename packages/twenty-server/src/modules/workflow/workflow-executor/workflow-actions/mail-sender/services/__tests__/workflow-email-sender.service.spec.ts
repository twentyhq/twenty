import { IsNull } from 'typeorm';

import { WorkflowEmailSenderService } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/services/workflow-email-sender.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';
const CONNECTED_ACCOUNT_ID = '20202020-1111-4111-8111-111111111111';
const WORKSPACE_MEMBER_ID = '20202020-2222-4222-8222-222222222222';
const USER_WORKSPACE_ID = '20202020-3333-4333-8333-333333333333';
const USER_ID = '20202020-4444-4444-8444-444444444444';
const MEMBER_ACCOUNT_ID = '20202020-5555-4555-8555-555555555555';

describe('WorkflowEmailSenderService', () => {
  let service: WorkflowEmailSenderService;
  let connectedAccountRepository: { findOne: jest.Mock };
  let userWorkspaceRepository: { findOne: jest.Mock };
  let workspaceMemberRepository: { findOne: jest.Mock };
  let globalWorkspaceOrmManager: {
    executeInWorkspaceContext: jest.Mock;
    getRepository: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    connectedAccountRepository = { findOne: jest.fn() };
    userWorkspaceRepository = { findOne: jest.fn() };
    workspaceMemberRepository = { findOne: jest.fn() };
    globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn((callback) => callback()),
      getRepository: jest.fn().mockResolvedValue(workspaceMemberRepository),
    };

    service = new WorkflowEmailSenderService(
      globalWorkspaceOrmManager as never,
      connectedAccountRepository as never,
      userWorkspaceRepository as never,
    );
  });

  it('returns the id unchanged when it is not a valid UUID', async () => {
    const result = await service.resolveSenderConnectedAccountId(
      'not-a-uuid',
      WORKSPACE_ID,
    );

    expect(result).toBe('not-a-uuid');
    expect(workspaceMemberRepository.findOne).not.toHaveBeenCalled();
  });

  it('returns the id unchanged when it does not match a workspace member', async () => {
    workspaceMemberRepository.findOne.mockResolvedValue(null);

    const result = await service.resolveSenderConnectedAccountId(
      CONNECTED_ACCOUNT_ID,
      WORKSPACE_ID,
    );

    expect(result).toBe(CONNECTED_ACCOUNT_ID);
    expect(connectedAccountRepository.findOne).not.toHaveBeenCalled();
  });

  it("resolves the workspace member's first connected account", async () => {
    workspaceMemberRepository.findOne.mockResolvedValue({ userId: USER_ID });
    userWorkspaceRepository.findOne.mockResolvedValue({ id: USER_WORKSPACE_ID });
    connectedAccountRepository.findOne.mockResolvedValue({
      id: MEMBER_ACCOUNT_ID,
    });

    const result = await service.resolveSenderConnectedAccountId(
      WORKSPACE_MEMBER_ID,
      WORKSPACE_ID,
    );

    expect(result).toBe(MEMBER_ACCOUNT_ID);
    expect(connectedAccountRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userWorkspaceId: USER_WORKSPACE_ID,
          workspaceId: WORKSPACE_ID,
          archivedAt: IsNull(),
        },
        order: { createdAt: 'ASC' },
      }),
    );
  });

  it('throws when the member has no connected account', async () => {
    workspaceMemberRepository.findOne.mockResolvedValue({ userId: USER_ID });
    userWorkspaceRepository.findOne.mockResolvedValue({ id: USER_WORKSPACE_ID });
    connectedAccountRepository.findOne.mockResolvedValue(null);

    await expect(
      service.resolveSenderConnectedAccountId(
        WORKSPACE_MEMBER_ID,
        WORKSPACE_ID,
      ),
    ).rejects.toThrow(
      `No connected account found for workspace member '${WORKSPACE_MEMBER_ID}'`,
    );
  });
});
