import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { type SendSlotRefusal } from 'src/engine/core-modules/emailing-domain/types/send-slot-refusal.type';
import { CAMPAIGN_FAILURE_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-failure-reason.constant';
import { CLAIMABLE_CAMPAIGN_DELIVERY_STATES } from 'src/engine/core-modules/emailing-domain/constants/claimable-campaign-delivery-states.constant';
import { MessageCampaignBatchDeliveryService } from 'src/modules/emailing/services/message-campaign-batch-delivery.service';

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
  const personRepository = {
    find: jest.fn(async () => [{ id: 'person-0' }, { id: 'person-1' }]),
  };

  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn(
      async (callback: () => Promise<unknown>) => callback(),
    ),
    getRepository: jest.fn((entity: unknown) =>
      entity === undefined ? messageRepository : personRepository,
    ),
  };

  const emailingDomainSenderService = { sendEmailBatch: jest.fn() };
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
    add: jest.fn(
      async (
        _jobName: string,
        _jobData: { recipients: unknown[] },
        _options?: unknown,
      ) => undefined,
    ),
  };
  const dataSource = {
    query: jest.fn(async () => claimedIds.map((id) => ({ id }))),
  };

  const service = new MessageCampaignBatchDeliveryService(
    campaignDeliveryRepository as never,
    dataSource as never,
    messageQueueService as never,
    workspaceOrmManager as never,
    emailingDomainSenderService as never,
    emailBillingService as never,
    campaignVariableService as never,
    messageCampaignLifecycleService as never,
    messageCampaignStatisticsService as never,
    campaignSendSlotService as never,
  );

  return {
    service,
    claimedIds,
    campaignDeliveryRepository,
    dataSource,
    emailingDomainSenderService,
    messageCampaignLifecycleService,
    campaignSendSlotService,
    messageQueueService,
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
      harness.service.processSendBatchJob(buildJobData(2)),
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

    await harness.service.processSendBatchJob(buildJobData(1));

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
      harness.service.processSendBatchJob(buildJobData(1)),
    ).rejects.toThrow('Upstream hiccup');
  });

  it('leaves mail the provider accepted in a state no retry can claim again', async () => {
    const harness = buildHarness();

    harness.claimedIds.push('message-0');
    harness.emailingDomainSenderService.sendEmailBatch.mockResolvedValue({
      entries: [
        {
          email: 'person0@example.com',
          messageId: 'provider-0',
          errorMessage: null,
        },
      ],
      suppressedRecipientIndexes: [],
    });
    harness.dataSource.query.mockRejectedValue(new Error('settle exploded'));

    await expect(
      harness.service.processSendBatchJob(buildJobData(1)),
    ).rejects.toThrow('settle exploded');

    const rescueCall =
      harness.campaignDeliveryRepository.update.mock.calls.find(
        ([, , update]) =>
          (update as { failureReason?: string }).failureReason ===
          CAMPAIGN_FAILURE_REASON.SETTLEMENT_LOST,
      );

    expect(rescueCall).toBeDefined();

    const rescuedState = (rescueCall?.[2] as { state: string }).state;

    expect(CLAIMABLE_CAMPAIGN_DELIVERY_STATES).not.toContain(rescuedState);
  });

  it('splits a rate-limited batch the workspace limit could never admit whole', async () => {
    const harness = buildHarness();

    harness.claimedIds.push('message-0', 'message-1', 'message-2');
    harness.campaignSendSlotService.findSendSlotRefusal.mockResolvedValue({
      retryDelayMs: 1000,
      windowMs: 1000,
      limitValue: 1,
    });

    await harness.service.processSendBatchJob(buildJobData(3));

    expect(harness.messageQueueService.add).toHaveBeenCalledTimes(3);

    const requeuedRecipientCounts =
      harness.messageQueueService.add.mock.calls.map(
        ([, jobData]) => jobData.recipients.length,
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

    await harness.service.processSendBatchJob(buildJobData(2));

    expect(harness.messageQueueService.add).toHaveBeenCalledTimes(1);
  });
});
