import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { buildAgentChatTurnRefusalException } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-turn-refusal-exception.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE_ID = 'workspace-id';

const buildQuotaRefusal = (
  exhaustedScope: Pick<
    ExhaustedScope,
    'exhaustedKind' | 'operationType' | 'spenderType'
  >,
): UsageRefusal => ({
  kind: 'quotaExhausted',
  exhaustedScope: {
    resourceType: UsageResourceType.AI,
    limitKind: 'quota',
    spenderId: null,
    limitValue: 5_000_000,
    remaining: 0,
    periodCount: 1,
    periodUnit: 'day',
    retryAfterMs: 1_000,
    ...exhaustedScope,
  },
});

describe('buildAgentChatTurnRefusalException', () => {
  it('pauses an included turn that reached the fair-use ceiling', () => {
    const exception = buildAgentChatTurnRefusalException({
      operationType: UsageOperationType.AI_CHAT_INCLUDED,
      refusal: buildQuotaRefusal({
        exhaustedKind: 'limit',
        operationType: UsageOperationType.AI_CHAT_INCLUDED,
        spenderType: 'workspace',
      }),
      workspaceId: WORKSPACE_ID,
    });

    expect(exception).toBeInstanceOf(AiException);
    expect(exception.code).toBe(AiExceptionCode.INCLUDED_CHAT_PAUSED);
  });

  it('keeps a suspended or unsubscribed workspace blocked on an included turn', () => {
    const exception = buildAgentChatTurnRefusalException({
      operationType: UsageOperationType.AI_CHAT_INCLUDED,
      refusal: { kind: 'subscriptionInactive', reason: 'WORKSPACE_SUSPENDED' },
      workspaceId: WORKSPACE_ID,
    });

    expect(exception).toBeInstanceOf(BillingException);
    expect(exception.code).toBe(
      BillingExceptionCode.BILLING_SUBSCRIPTION_INACTIVE,
    );
  });

  it('refuses a paid turn on an exhausted allowance as before', () => {
    const exception = buildAgentChatTurnRefusalException({
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      refusal: buildQuotaRefusal({
        exhaustedKind: 'allowance',
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        spenderType: 'workspace',
      }),
      workspaceId: WORKSPACE_ID,
    });

    expect(exception).toBeInstanceOf(UsageLimitException);
    expect(exception.code).toBe(UsageLimitExceptionCode.QUOTA_EXHAUSTED);
    expect((exception as UsageLimitException).exhaustedScope).toMatchObject({
      exhaustedKind: 'allowance',
    });
  });

  it('refuses a paid turn on a member limit as a limit the customer can manage', () => {
    const exception = buildAgentChatTurnRefusalException({
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      refusal: buildQuotaRefusal({
        exhaustedKind: 'limit',
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        spenderType: 'userWorkspace',
      }),
      workspaceId: WORKSPACE_ID,
    });

    expect(exception).toBeInstanceOf(UsageLimitException);
    expect((exception as UsageLimitException).exhaustedScope).toMatchObject({
      exhaustedKind: 'limit',
      spenderType: 'userWorkspace',
    });
  });

  it('does not pause an included turn for a limit outside the included operation', () => {
    const exception = buildAgentChatTurnRefusalException({
      operationType: UsageOperationType.AI_CHAT_INCLUDED,
      refusal: buildQuotaRefusal({
        exhaustedKind: 'limit',
        operationType: UsageOperationType.ALL,
        spenderType: 'workspace',
      }),
      workspaceId: WORKSPACE_ID,
    });

    expect(exception).toBeInstanceOf(UsageLimitException);
    expect(exception.code).toBe(UsageLimitExceptionCode.QUOTA_EXHAUSTED);
  });
});
