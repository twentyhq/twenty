import { Test, type TestingModule } from '@nestjs/testing';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';
import { MessageCampaignDraftService } from 'src/modules/emailing/services/message-campaign-draft.service';
import { SaveCampaignTool } from 'src/modules/emailing/tools/save-campaign-tool';
import { SaveCampaignToolInputZodSchema } from 'src/modules/emailing/tools/save-campaign-tool.schema';

describe('SaveCampaignTool', () => {
  let tool: SaveCampaignTool;
  let saveDraft: jest.Mock;

  const campaignId = '20202020-0000-4000-8000-000000000001';

  beforeEach(async () => {
    saveDraft = jest.fn().mockResolvedValue({
      campaignId,
      campaignName: 'Monthly newsletter',
      created: false,
      blockCount: 3,
      variablesUsed: ['firstName'],
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveCampaignTool,
        {
          provide: MessageCampaignDraftService,
          useValue: { saveDraft },
        },
      ],
    }).compile();

    tool = module.get(SaveCampaignTool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should edit a campaign and reference the record', async () => {
    const output = await tool.execute(
      { campaignId, body: { type: 'doc', content: [] } },
      { workspaceId: 'workspace-1', userWorkspaceId: 'user-workspace-1' },
    );

    expect(output.success).toBe(true);
    expect(output.message).toContain('updated');
    expect(output.recordReferences).toEqual([
      {
        objectNameSingular: 'messageCampaign',
        recordId: campaignId,
        displayName: 'Monthly newsletter',
      },
    ]);
    expect(saveDraft).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      userWorkspaceId: 'user-workspace-1',
      campaignId,
      name: undefined,
      subject: undefined,
      body: { type: 'doc', content: [] },
    });
  });

  it('should create a campaign when no id is provided', async () => {
    saveDraft.mockResolvedValue({
      campaignId,
      campaignName: 'Launch announcement',
      created: true,
      variablesUsed: [],
    });

    const output = await tool.execute(
      { name: 'Launch announcement' },
      { workspaceId: 'workspace-1', userWorkspaceId: 'user-workspace-1' },
    );

    expect(output.success).toBe(true);
    expect(output.message).toContain('created');
  });

  it('should refuse to run without a workspace member context', async () => {
    const output = await tool.execute(
      { name: 'Launch announcement' },
      { workspaceId: 'workspace-1' },
    );

    expect(output.success).toBe(false);
    expect(saveDraft).not.toHaveBeenCalled();
  });

  it('should expose an input schema convertible to JSON schema for the LLM', () => {
    // The registry converts inputSchema at descriptor build time; the
    // recursive document schema must survive that conversion.
    const jsonSchema = toToolJsonSchema(SaveCampaignToolInputZodSchema) as {
      properties?: Record<string, unknown>;
      required?: string[];
    };

    expect(jsonSchema.properties?.campaignId).toBeDefined();
    expect(jsonSchema.properties?.name).toBeDefined();
    expect(jsonSchema.properties?.subject).toBeDefined();
    expect(jsonSchema.properties?.body).toBeDefined();
    expect(jsonSchema.required ?? []).toEqual([]);
    expect(JSON.stringify(jsonSchema)).toContain('emailSection');
  });

  it('should surface domain errors as tool output', async () => {
    saveDraft.mockRejectedValue(
      new EmailingDomainException(
        'Campaign is SENT; only draft campaigns can be edited',
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      ),
    );

    const output = await tool.execute(
      { campaignId, subject: 'New subject' },
      { workspaceId: 'workspace-1', userWorkspaceId: 'user-workspace-1' },
    );

    expect(output).toEqual({
      success: false,
      message: 'Failed to save campaign',
      error: 'Campaign is SENT; only draft campaigns can be edited',
    });
  });
});
