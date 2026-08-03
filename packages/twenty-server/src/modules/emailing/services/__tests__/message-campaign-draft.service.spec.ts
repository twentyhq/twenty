import { Test, type TestingModule } from '@nestjs/testing';

import { MessageCampaignStatus } from 'twenty-shared/types';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { CampaignVariableService } from 'src/modules/emailing/services/campaign-variable.service';
import { MessageCampaignDraftService } from 'src/modules/emailing/services/message-campaign-draft.service';

describe('MessageCampaignDraftService', () => {
  let service: MessageCampaignDraftService;
  let assertKnownVariables: jest.Mock;
  let campaignRepository: {
    findOne: jest.Mock;
    insert: jest.Mock;
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
    assertKnownVariables = jest.fn().mockResolvedValue(undefined);
    campaignRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: campaignId,
        name: 'Monthly newsletter',
        status: MessageCampaignStatus.DRAFT,
      }),
      insert: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageCampaignDraftService,
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

    service = module.get(MessageCampaignDraftService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('creating', () => {
    it('should insert a draft with name, subject and stamped body', async () => {
      const result = await service.saveDraft({
        workspaceId,
        userWorkspaceId,
        name: 'Launch announcement',
        subject: 'Hi {{firstName}}, we launched',
        body: validDocument,
      });

      expect(result.created).toBe(true);
      expect(result.campaignName).toBe('Launch announcement');
      expect(result.variablesUsed).toEqual(['firstName']);

      const [inserted] = campaignRepository.insert.mock.calls[0];

      expect(inserted.name).toBe('Launch announcement');
      expect(inserted.subject).toBe('Hi {{firstName}}, we launched');
      expect(inserted.status).toBe(MessageCampaignStatus.DRAFT);

      const storedDocument = JSON.parse(inserted.bodyTemplate);

      expect(storedDocument.attrs.schemaVersion).toBe(1);
      expect(storedDocument.attrs.emailTheme).toBeDefined();
      expect(campaignRepository.update).not.toHaveBeenCalled();
    });

    it('should create an empty draft with a default name', async () => {
      const result = await service.saveDraft({ workspaceId, userWorkspaceId });

      expect(result.created).toBe(true);
      expect(result.campaignName).toBe('Untitled campaign');

      const [inserted] = campaignRepository.insert.mock.calls[0];

      expect(inserted.subject).toBeUndefined();
      expect(inserted.bodyTemplate).toBeUndefined();
      expect(assertKnownVariables).not.toHaveBeenCalled();
    });

    it('should validate subject variables on create', async () => {
      assertKnownVariables.mockRejectedValue(
        new EmailingDomainException(
          'Unknown campaign variables: frstName',
          EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
        ),
      );

      await expect(
        service.saveDraft({
          workspaceId,
          userWorkspaceId,
          subject: 'Hi {{frstName}}',
        }),
      ).rejects.toThrow(/Unknown campaign variables/);

      expect(campaignRepository.insert).not.toHaveBeenCalled();
    });
  });

  describe('editing', () => {
    it('should update only the provided fields', async () => {
      const result = await service.saveDraft({
        workspaceId,
        userWorkspaceId,
        campaignId,
        subject: 'New subject',
      });

      expect(result.created).toBe(false);
      expect(result.campaignName).toBe('Monthly newsletter');

      const [criteria, update] = campaignRepository.update.mock.calls[0];

      expect(criteria).toEqual({
        id: campaignId,
        status: MessageCampaignStatus.DRAFT,
      });
      expect(update).toEqual({ subject: 'New subject' });
    });

    it('should stamp and write a body update', async () => {
      await service.saveDraft({
        workspaceId,
        userWorkspaceId,
        campaignId,
        body: validDocument,
      });

      const [, update] = campaignRepository.update.mock.calls[0];
      const storedDocument = JSON.parse(update.bodyTemplate);

      expect(storedDocument.attrs.schemaVersion).toBe(1);
      expect(storedDocument.attrs.emailTheme).toBeDefined();
    });

    it('should keep an explicit theme instead of stamping defaults', async () => {
      await service.saveDraft({
        workspaceId,
        userWorkspaceId,
        campaignId,
        body: {
          ...validDocument,
          attrs: { emailTheme: { bodyBackground: '#101010', width: '480px' } },
        },
      });

      const [, update] = campaignRepository.update.mock.calls[0];
      const storedDocument = JSON.parse(update.bodyTemplate);

      expect(storedDocument.attrs.emailTheme.bodyBackground).toBe('#101010');
    });

    it('should reject an edit with nothing to update', async () => {
      await expect(
        service.saveDraft({ workspaceId, userWorkspaceId, campaignId }),
      ).rejects.toThrow(/Nothing to update/);

      expect(campaignRepository.update).not.toHaveBeenCalled();
    });

    it('should reject a document with an unknown block type without writing', async () => {
      await expect(
        service.saveDraft({
          workspaceId,
          userWorkspaceId,
          campaignId,
          body: {
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
        service.saveDraft({
          workspaceId,
          userWorkspaceId,
          campaignId,
          body: {
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
        service.saveDraft({
          workspaceId,
          userWorkspaceId,
          campaignId,
          subject: 'New subject',
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
        service.saveDraft({
          workspaceId,
          userWorkspaceId,
          campaignId,
          subject: 'New subject',
        }),
      ).rejects.toThrow(/only draft campaigns/);

      expect(campaignRepository.update).not.toHaveBeenCalled();
    });

    it('should surface a lost race against a concurrent send', async () => {
      campaignRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.saveDraft({
          workspaceId,
          userWorkspaceId,
          campaignId,
          subject: 'New subject',
        }),
      ).rejects.toThrow(/no longer an editable draft/);
    });
  });
});
