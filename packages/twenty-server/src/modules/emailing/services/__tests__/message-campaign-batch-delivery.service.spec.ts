import { getDataSourceToken } from '@nestjs/typeorm';
import { Test, type TestingModule } from '@nestjs/testing';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { type SendSlotRefusal } from 'src/engine/core-modules/emailing-domain/types/send-slot-refusal.type';
import { CAMPAIGN_FAILURE_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-failure-reason.constant';
import { CLAIMABLE_CAMPAIGN_DELIVERY_STATES } from 'src/engine/core-modules/emailing-domain/constants/claimable-campaign-delivery-states.constant';
import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { CampaignSendSlotService } from 'src/modules/emailing/services/campaign-send-slot.service';
import { EmailBillingService } from 'src/modules/emailing/services/email-billing.service';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { CampaignVariableService } from 'src/modules/emailing/services/campaign-variable.service';
import { MessageCampaignBatchDeliveryService } from 'src/modules/emailing/services/message-campaign-batch-delivery.service';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

const WORKSPACE_ID = 'ec9b0b2a-4c02-4d1e-9f2a-9b1c0a5d7e31';
const CAMPAIGN_ID = 'b1f0c6d5-3f9b-4a4e-9a5c-2f7d8e6b4a10';

const BODY_TEMPLATE = JSON.stringify({
  type: 'doc',
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] }],
});

const buildRecipient = (index: number) => ({
  messageId: `message-${index}`,
  personId: `person-${index}`,
  email: `person${index}@example.com`,
});

const buildJobData = (recipientCount: number) => ({
  workspaceId: WORKSPACE_ID,
  campaignId: CAMPAIGN_ID,
  emailingDomainId: 'domain-1',
  userWorkspaceId: 'user-workspace-1',
  recipients: Array.from({ length: recipientCount }, (_unused, index) =>
    buildRecipient(index),
  ),
});

// buildCampaignDeliverySettleQuery passes the settlement columns as parallel
// arrays; this reads one back as rows.
const decodeSettleCall = (parameters: unknown[]) => {
  const [ids, states, , failureReasons, providerMessageIds] =
    parameters as string[][];

  return ids.map((id, index) => ({
    deliveryId: id,
    state: states[index],
    failureReason: failureReasons[index],
    providerMessageId: providerMessageIds[index],
  }));
};

const buildHarness = () => {
  const claimedIds: string[] = [];

  const queryBuilder = {
    update: () => queryBuilder,
    set: () => queryBuilder,
    where: () => queryBuilder,
    andWhere: () => queryBuilder,
    returning: () => queryBuilder,
    execute: jest.fn(async () => ({
      raw: claimedIds.map((id) => ({ id })),
    })),
  };

  const campaignDeliveryRepository = {
    createQueryBuilder: () => queryBuilder,
    update: jest.fn(
      async (
        _workspaceId: string,
        _criteria: unknown,
        _update: Record<string, unknown>,
      ) => ({ affected: claimedIds.length }),
    ),
  };

  const messageRepository = { update: jest.fn(async () => ({ affected: 1 })) };
  const associationRepository = {
    update: jest.fn(async () => ({ affected: 1 })),
  };
  const personRepository = {
    find: jest.fn(async () => [{ id: 'person-0' }, { id: 'person-1' }]),
  };

  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn(
      async (callback: () => Promise<unknown>) => callback(),
    ),
    getRepository: jest.fn((entity: unknown) => {
      if (entity === MessageWorkspaceEntity) {
        return messageRepository;
      }

      if (entity === MessageChannelMessageAssociationWorkspaceEntity) {
        return associationRepository;
      }

      return personRepository;
    }),
  };

  const emailingDomainSenderService = {
    sendEmailBatch: jest.fn(),
    findBlockedRecipientAddresses: jest.fn(async () => new Set<string>()),
  };
  const emailBillingService = {
    getEmailCreditContext: jest.fn(async () => ({ hasCredits: true })),
    billSentEmails: jest.fn(async () => undefined),
  };
  const campaignVariableService = {
    buildVariablesForPerson: jest.fn(async () => ({})),
  };
  const messageCampaignLifecycleService = {
    findRunningCampaign: jest.fn(async () => ({
      id: CAMPAIGN_ID,
      subject: 'Newsletter',
      bodyTemplate: BODY_TEMPLATE,
      fromAddress: { primaryEmail: 'sender@example.com' },
      unsubscribeTopicId: null,
    })),
    finalizeCampaignIfComplete: jest.fn(async () => undefined),
  };
  const messageCampaignStatisticsService = {
    scheduleRefresh: jest.fn(async () => undefined),
  };
  const campaignSendSlotService = {
    findSendSlotRefusal: jest.fn(
      async (): Promise<SendSlotRefusal | null> => null,
    ),
  };
  const messageQueueService = {
    bulkAdd: jest.fn(
      async (
        _jobName: string,
        _jobs: { data: { recipients: unknown[] } }[],
        _options?: unknown,
      ) => [],
    ),
  };
  const dataSource = {
    query: jest.fn(async (_sql: string, _parameters: unknown[]) =>
      claimedIds.map((id) => ({ id })),
    ),
  };

  const buildService = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageCampaignBatchDeliveryService,
        {
          provide: getWorkspaceScopedRepositoryToken(CampaignDeliveryEntity),
          useValue: campaignDeliveryRepository,
        },
        { provide: getDataSourceToken(), useValue: dataSource },
        {
          provide: getQueueToken(MessageQueue.campaignSendQueue),
          useValue: messageQueueService,
        },
        { provide: WorkspaceOrmManager, useValue: workspaceOrmManager },
        {
          provide: EmailingDomainSenderService,
          useValue: emailingDomainSenderService,
        },
        { provide: EmailBillingService, useValue: emailBillingService },
        { provide: CampaignVariableService, useValue: campaignVariableService },
        {
          provide: MessageCampaignLifecycleService,
          useValue: messageCampaignLifecycleService,
        },
        {
          provide: MessageCampaignStatisticsService,
          useValue: messageCampaignStatisticsService,
        },
        { provide: CampaignSendSlotService, useValue: campaignSendSlotService },
      ],
    }).compile();

    return module.get(MessageCampaignBatchDeliveryService);
  };

  return {
    buildService,
    claimedIds,
    campaignDeliveryRepository,
    dataSource,
    emailingDomainSenderService,
    messageCampaignLifecycleService,
    campaignSendSlotService,
    messageQueueService,
    messageRepository,
    associationRepository,
    emailBillingService,
  };
};

describe('MessageCampaignBatchDeliveryService', () => {
  // Compiling the email document awaits a renderer that never settles under
  // the suite's fake timers.
  beforeAll(() => {
    jest.useRealTimers();
  });

  it('does not rethrow a provider failure no retry can fix, so the campaign still finalizes', async () => {
    const harness = buildHarness();

    harness.claimedIds.push('message-0', 'message-1');
    harness.emailingDomainSenderService.sendEmailBatch.mockRejectedValue(
      new EmailingDomainDriverException(
        'Sending is not configured',
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      ),
    );

    await expect(
      (await harness.buildService()).processSendBatchJob(buildJobData(2)),
    ).resolves.toBeUndefined();

    expect(
      harness.messageCampaignLifecycleService.finalizeCampaignIfComplete,
    ).toHaveBeenCalled();
  });

  it('settles a terminal provider failure into its own state rather than back to queued', async () => {
    const harness = buildHarness();

    harness.claimedIds.push('message-0');
    harness.emailingDomainSenderService.sendEmailBatch.mockRejectedValue(
      new EmailingDomainDriverException(
        'Sandbox account',
        EmailingDomainDriverExceptionCode.SANDBOX_ACCOUNT,
      ),
    );

    await (await harness.buildService()).processSendBatchJob(buildJobData(1));

    const settleCall =
      harness.campaignDeliveryRepository.update.mock.calls.find(
        ([, , update]) =>
          (update as { failureReason?: string }).failureReason ===
          CAMPAIGN_FAILURE_REASON.SANDBOX_ACCOUNT,
      );

    expect(settleCall).toBeDefined();
    expect((settleCall?.[2] as { state: string }).state).toBe(
      CAMPAIGN_DELIVERY_STATE.FAILED,
    );
  });

  it('rethrows a retriable provider failure so the job runs again', async () => {
    const harness = buildHarness();

    harness.claimedIds.push('message-0');
    harness.emailingDomainSenderService.sendEmailBatch.mockRejectedValue(
      new EmailingDomainDriverException(
        'Upstream hiccup',
        EmailingDomainDriverExceptionCode.TEMPORARY_ERROR,
      ),
    );

    await expect(
      (await harness.buildService()).processSendBatchJob(buildJobData(1)),
    ).rejects.toThrow('Upstream hiccup');
  });

  it('keeps mail the provider accepted out of any state a retry could claim', async () => {
    const harness = buildHarness();

    harness.claimedIds.push('message-0');
    harness.emailingDomainSenderService.sendEmailBatch.mockResolvedValue({
      entries: [
        { recipientIndex: 0, messageId: 'provider-0', errorMessage: null },
      ],
      suppressedRecipientIndexes: [],
    });
    // The settle statement fails once; the rescue reruns it.
    harness.dataSource.query
      .mockRejectedValueOnce(new Error('settle exploded'))
      .mockResolvedValue([{ id: 'message-0' }]);

    await expect(
      (await harness.buildService()).processSendBatchJob(buildJobData(1)),
    ).rejects.toThrow('settle exploded');

    const [rescued] = decodeSettleCall(
      harness.dataSource.query.mock.calls[1][1],
    );

    expect(CLAIMABLE_CAMPAIGN_DELIVERY_STATES).not.toContain(rescued.state);
    // Keeping the provider id is what lets a later bounce or delivery webhook
    // still find this row.
    expect(rescued.providerMessageId).toBe('provider-0');
    expect(rescued.failureReason).toBe(CAMPAIGN_FAILURE_REASON.SETTLEMENT_LOST);
  });

  it('does not count a recipient the provider rejected as sent when settling throws', async () => {
    const harness = buildHarness();

    harness.claimedIds.push('message-0', 'message-1');
    harness.emailingDomainSenderService.sendEmailBatch.mockResolvedValue({
      entries: [
        { recipientIndex: 0, messageId: 'provider-0', errorMessage: null },
        { recipientIndex: 1, messageId: null, errorMessage: 'rejected' },
      ],
      suppressedRecipientIndexes: [],
    });
    harness.dataSource.query
      .mockRejectedValueOnce(new Error('settle exploded'))
      .mockResolvedValue([]);

    await expect(
      (await harness.buildService()).processSendBatchJob(buildJobData(2)),
    ).rejects.toThrow('settle exploded');

    const rescuedRows = harness.dataSource.query.mock.calls
      .slice(1)
      .flatMap(([, parameters]) => decodeSettleCall(parameters));

    expect(
      rescuedRows.find((row) => row.deliveryId === 'message-0')?.state,
    ).toBe(CAMPAIGN_DELIVERY_STATE.SENT);
    expect(
      rescuedRows.find((row) => row.deliveryId === 'message-1')?.state,
    ).toBe(CAMPAIGN_DELIVERY_STATE.FAILED);
  });

  it('settles the accepted rows before the rejected ones, so a half-failed rescue cannot re-send', async () => {
    const harness = buildHarness();

    harness.claimedIds.push('message-0', 'message-1');
    harness.emailingDomainSenderService.sendEmailBatch.mockResolvedValue({
      entries: [
        { recipientIndex: 0, messageId: 'provider-0', errorMessage: null },
        { recipientIndex: 1, messageId: null, errorMessage: 'rejected' },
      ],
      suppressedRecipientIndexes: [],
    });
    harness.dataSource.query
      .mockRejectedValueOnce(new Error('settle exploded'))
      .mockResolvedValue([]);

    await expect(
      (await harness.buildService()).processSendBatchJob(buildJobData(2)),
    ).rejects.toThrow('settle exploded');

    // Whatever the rescue does not reach is re-queued by the finally block, so
    // the rows the provider took have to be settled by the first of the two.
    const [acceptedFirst] = decodeSettleCall(
      harness.dataSource.query.mock.calls[1][1],
    );

    expect(acceptedFirst.deliveryId).toBe('message-0');
  });

  it('records the message, the association and the billing for a delivered batch', async () => {
    const harness = buildHarness();

    harness.claimedIds.push('message-0');
    harness.emailingDomainSenderService.sendEmailBatch.mockResolvedValue({
      entries: [
        { recipientIndex: 0, messageId: 'provider-0', errorMessage: null },
      ],
      suppressedRecipientIndexes: [],
    });

    await (await harness.buildService()).processSendBatchJob(buildJobData(1));

    expect(harness.messageRepository.update).toHaveBeenCalledWith(
      'message-0',
      expect.objectContaining({ headerMessageId: 'provider-0' }),
    );
    expect(harness.associationRepository.update).toHaveBeenCalledWith(
      { messageId: 'message-0' },
      expect.objectContaining({ messageExternalId: 'provider-0' }),
    );
    expect(harness.emailBillingService.billSentEmails).toHaveBeenCalledWith(
      expect.objectContaining({ sentEmailCount: 1 }),
    );
  });

  it('asks for slots for the deliverable recipients only, not the suppressed ones', async () => {
    const harness = buildHarness();

    harness.claimedIds.push('message-0', 'message-1', 'message-2');
    harness.emailingDomainSenderService.findBlockedRecipientAddresses.mockResolvedValue(
      new Set(['person1@example.com', 'person2@example.com']),
    );
    harness.emailingDomainSenderService.sendEmailBatch.mockResolvedValue({
      entries: [
        { recipientIndex: 0, messageId: 'provider-0', errorMessage: null },
      ],
      suppressedRecipientIndexes: [1, 2],
    });

    await (await harness.buildService()).processSendBatchJob(buildJobData(3));

    expect(
      harness.campaignSendSlotService.findSendSlotRefusal,
    ).toHaveBeenCalledWith(expect.objectContaining({ requestedSlotCount: 1 }));
  });

  it('spends no send capacity at all when every recipient is suppressed', async () => {
    const harness = buildHarness();

    harness.claimedIds.push('message-0');
    harness.emailingDomainSenderService.findBlockedRecipientAddresses.mockResolvedValue(
      new Set(['person0@example.com']),
    );
    harness.emailingDomainSenderService.sendEmailBatch.mockResolvedValue({
      entries: [],
      suppressedRecipientIndexes: [0],
    });

    await (await harness.buildService()).processSendBatchJob(buildJobData(1));

    expect(
      harness.campaignSendSlotService.findSendSlotRefusal,
    ).not.toHaveBeenCalled();
  });

  it('splits a rate-limited batch the workspace limit could never admit whole', async () => {
    const harness = buildHarness();

    harness.claimedIds.push('message-0', 'message-1', 'message-2');
    harness.campaignSendSlotService.findSendSlotRefusal.mockResolvedValue({
      retryDelayMs: 1000,
      windowMs: 1000,
      limitValue: 1,
    });

    await (await harness.buildService()).processSendBatchJob(buildJobData(3));

    expect(harness.messageQueueService.bulkAdd).toHaveBeenCalledTimes(1);

    const requeuedRecipientCounts =
      harness.messageQueueService.bulkAdd.mock.calls[0][1].map(
        (job) => job.data.recipients.length,
      );

    expect(requeuedRecipientCounts).toEqual([1, 1, 1]);
  });

  it('re-queues a rate-limited batch whole when it already fits the limit', async () => {
    const harness = buildHarness();

    harness.claimedIds.push('message-0', 'message-1');
    harness.campaignSendSlotService.findSendSlotRefusal.mockResolvedValue({
      retryDelayMs: 1000,
      windowMs: 1000,
      limitValue: 50,
    });

    await (await harness.buildService()).processSendBatchJob(buildJobData(2));

    expect(harness.messageQueueService.bulkAdd.mock.calls[0][1]).toHaveLength(
      1,
    );
  });
});
