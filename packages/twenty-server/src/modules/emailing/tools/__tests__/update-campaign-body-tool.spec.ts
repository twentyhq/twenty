import { Test, type TestingModule } from '@nestjs/testing';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';
import { MessageCampaignBodyService } from 'src/modules/emailing/services/message-campaign-body.service';
import { UpdateCampaignBodyTool } from 'src/modules/emailing/tools/update-campaign-body-tool';
import { UpdateCampaignBodyToolInputZodSchema } from 'src/modules/emailing/tools/update-campaign-body-tool.schema';

describe('UpdateCampaignBodyTool', () => {
  let tool: UpdateCampaignBodyTool;
  let updateDraftBody: jest.Mock;

  const campaignId = '20202020-0000-4000-8000-000000000001';
  const parameters = {
    campaignId,
    body: { type: 'doc' as const, content: [] },
  };

  beforeEach(async () => {
    updateDraftBody = jest.fn().mockResolvedValue({
      campaignId,
      campaignName: 'Monthly newsletter',
      blockCount: 3,
      variablesUsed: ['firstName'],
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCampaignBodyTool,
        {
          provide: MessageCampaignBodyService,
          useValue: { updateDraftBody },
        },
      ],
    }).compile();

    tool = module.get(UpdateCampaignBodyTool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update the body and reference the campaign record', async () => {
    const output = await tool.execute(parameters, {
      workspaceId: 'workspace-1',
      userWorkspaceId: 'user-workspace-1',
    });

    expect(output.success).toBe(true);
    expect(output.recordReferences).toEqual([
      {
        objectNameSingular: 'messageCampaign',
        recordId: campaignId,
        displayName: 'Monthly newsletter',
      },
    ]);
    expect(updateDraftBody).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      userWorkspaceId: 'user-workspace-1',
      campaignId,
      document: parameters.body,
    });
  });

  it('should refuse to run without a workspace member context', async () => {
    const output = await tool.execute(parameters, {
      workspaceId: 'workspace-1',
    });

    expect(output.success).toBe(false);
    expect(updateDraftBody).not.toHaveBeenCalled();
  });

  it('should expose an input schema convertible to JSON schema for the LLM', () => {
    // The registry converts inputSchema at descriptor build time; the
    // recursive document schema must survive that conversion.
    const jsonSchema = toToolJsonSchema(
      UpdateCampaignBodyToolInputZodSchema,
    ) as {
      properties?: Record<string, unknown>;
    };

    expect(jsonSchema.properties?.campaignId).toBeDefined();
    expect(jsonSchema.properties?.body).toBeDefined();
    expect(JSON.stringify(jsonSchema)).toContain('emailSection');
  });

  it('should surface domain errors as tool output', async () => {
    updateDraftBody.mockRejectedValue(
      new EmailingDomainException(
        'Campaign is SENT; only draft campaigns can be edited',
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      ),
    );

    const output = await tool.execute(parameters, {
      workspaceId: 'workspace-1',
      userWorkspaceId: 'user-workspace-1',
    });

    expect(output).toEqual({
      success: false,
      message: 'Failed to update campaign body',
      error: 'Campaign is SENT; only draft campaigns can be edited',
    });
  });
});
