import { Test, type TestingModule } from '@nestjs/testing';

import { MessageCampaignStatus } from 'twenty-shared/types';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { CampaignVariableService } from 'src/modules/emailing/services/campaign-variable.service';
import { MessageCampaignBodyService } from 'src/modules/emailing/services/message-campaign-body.service';

describe('MessageCampaignBodyService', () => {
  let service: MessageCampaignBodyService;
  let assertKnownVariables: jest.Mock;
  let campaignRepository: {
    findOne: jest.Mock;
    update: jest.Mock;
  };

  const workspaceId = 'workspace-1';
  const userWorkspaceId = 'user-workspace-1';
  const campaignId = '20202020-0000-4000-8000-000000000001';

  const validDocument = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Hello ' },
          { type: 'variableTag', attrs: { variable: '{{firstName}}' } },
        ],
      },
    ],
  };

  beforeEach(async () => {
    campaignRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: campaignId,
        name: 'Monthly newsletter',
        status: MessageCampaignStatus.DRAFT,
      }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    assertKnownVariables = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageCampaignBodyService,
        {
          provide: CampaignVariableService,
          useValue: { assertKnownVariables },
        },
        {
          provide: UserRoleService,
          useValue: {
            getRoleIdForUserWorkspace: jest.fn().mockResolvedValue('role-1'),
          },
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            getRepository: jest.fn().mockResolvedValue(campaignRepository),
            executeInWorkspaceContext: jest.fn(
              (callback: () => Promise<unknown>) => callback(),
            ),
          },
        },
      ],
    }).compile();

    service = module.get(MessageCampaignBodyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate, stamp and write a valid document', async () => {
    const result = await service.updateDraftBody({
      workspaceId,
      userWorkspaceId,
      campaignId,
      document: validDocument,
    });

    expect(result).toEqual({
      campaignId,
      campaignName: 'Monthly newsletter',
      blockCount: 1,
      variablesUsed: ['firstName'],
    });

    const [criteria, update] = campaignRepository.update.mock.calls[0];

    expect(criteria).toEqual({
      id: campaignId,
      status: MessageCampaignStatus.DRAFT,
    });

    const storedDocument = JSON.parse(update.bodyTemplate);

    expect(storedDocument.attrs.schemaVersion).toBe(1);
    expect(storedDocument.attrs.emailTheme).toBeDefined();
  });

  it('should keep an explicit theme instead of stamping defaults', async () => {
    await service.updateDraftBody({
      workspaceId,
      userWorkspaceId,
      campaignId,
      document: {
        ...validDocument,
        attrs: { emailTheme: { bodyBackground: '#101010', width: '480px' } },
      },
    });

    const [, update] = campaignRepository.update.mock.calls[0];
    const storedDocument = JSON.parse(update.bodyTemplate);

    expect(storedDocument.attrs.emailTheme.bodyBackground).toBe('#101010');
  });

  it('should reject a document with an unknown block type without writing', async () => {
    await expect(
      service.updateDraftBody({
        workspaceId,
        userWorkspaceId,
        campaignId,
        document: {
          type: 'doc',
          content: [{ type: 'countdownTimer', attrs: {} }],
        },
      }),
    ).rejects.toThrow(EmailingDomainException);

    expect(campaignRepository.update).not.toHaveBeenCalled();
  });

  it('should reject unknown variables without writing', async () => {
    assertKnownVariables.mockRejectedValue(
      new EmailingDomainException(
        'Unknown campaign variables: firstNam',
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      ),
    );

    await expect(
      service.updateDraftBody({
        workspaceId,
        userWorkspaceId,
        campaignId,
        document: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Hi {{firstNam}}' }],
            },
          ],
        },
      }),
    ).rejects.toThrow(/Unknown campaign variables: firstNam/);

    expect(assertKnownVariables).toHaveBeenCalledWith(workspaceId, [
      'firstNam',
    ]);
    expect(campaignRepository.update).not.toHaveBeenCalled();
  });

  it('should reject when the campaign does not exist', async () => {
    campaignRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateDraftBody({
        workspaceId,
        userWorkspaceId,
        campaignId,
        document: validDocument,
      }),
    ).rejects.toThrow(/not found/);
  });

  it('should reject when the campaign already left DRAFT', async () => {
    campaignRepository.findOne.mockResolvedValue({
      id: campaignId,
      name: 'Monthly newsletter',
      status: MessageCampaignStatus.SENT,
    });

    await expect(
      service.updateDraftBody({
        workspaceId,
        userWorkspaceId,
        campaignId,
        document: validDocument,
      }),
    ).rejects.toThrow(/only draft campaigns/);

    expect(campaignRepository.update).not.toHaveBeenCalled();
  });

  it('should surface a lost race against a concurrent send', async () => {
    campaignRepository.update.mockResolvedValue({ affected: 0 });

    await expect(
      service.updateDraftBody({
        workspaceId,
        userWorkspaceId,
        campaignId,
        document: validDocument,
      }),
    ).rejects.toThrow(/no longer an editable draft/);
  });
});
