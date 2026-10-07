import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { selectAgentChatTurnModel } from 'src/engine/metadata-modules/ai/ai-chat/utils/select-agent-chat-turn-model.util';
import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

const buildModel = (modelId: string) => ({ modelId }) as RegisteredAiModel;

const INCLUDED_MODEL = buildModel('azure-foundry/gpt-5.6-luna@medium');
const INCLUDED_MODEL_AT_LOWER_EFFORT = buildModel(
  'azure-foundry/gpt-5.6-luna@low',
);
const INCLUDED_MODEL_AT_HIGHER_EFFORT = buildModel(
  'azure-foundry/gpt-5.6-luna@high',
);
const SAME_MODEL_ON_ANOTHER_ROUTE = buildModel('openai/gpt-5.6-luna@medium');
const PAID_MODEL = buildModel('anthropic/claude-sonnet-5@high');

describe('selectAgentChatTurnModel', () => {
  it('bills the requested model when the workspace has no included model', () => {
    expect(
      selectAgentChatTurnModel({
        requestedModel: INCLUDED_MODEL,
        includedModel: null,
        isFollowingWorkspaceTier: true,
        isAllowanceExhausted: true,
      }),
    ).toEqual({
      registeredModel: INCLUDED_MODEL,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
    });
  });

  it.each([
    ['the included model', INCLUDED_MODEL],
    ['the included model at a lower effort', INCLUDED_MODEL_AT_LOWER_EFFORT],
  ])(
    'includes %s whatever the allowance, picked or followed',
    (_, requestedModel) => {
      for (const isFollowingWorkspaceTier of [true, false]) {
        for (const isAllowanceExhausted of [true, false]) {
          expect(
            selectAgentChatTurnModel({
              requestedModel,
              includedModel: INCLUDED_MODEL,
              isFollowingWorkspaceTier,
              isAllowanceExhausted,
            }),
          ).toEqual({
            registeredModel: requestedModel,
            operationType: UsageOperationType.AI_CHAT_INCLUDED,
          });
        }
      }
    },
  );

  it.each([
    ['the included model at a higher effort', INCLUDED_MODEL_AT_HIGHER_EFFORT],
    ['the same model on another route', SAME_MODEL_ON_ANOTHER_ROUTE],
    ['another model', PAID_MODEL],
  ])('bills %s while the allowance has room', (_, requestedModel) => {
    expect(
      selectAgentChatTurnModel({
        requestedModel,
        includedModel: INCLUDED_MODEL,
        isFollowingWorkspaceTier: true,
        isAllowanceExhausted: false,
      }),
    ).toEqual({
      registeredModel: requestedModel,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
    });
  });

  it('switches a send that follows the workspace tier to the included model once the allowance is exhausted', () => {
    expect(
      selectAgentChatTurnModel({
        requestedModel: PAID_MODEL,
        includedModel: INCLUDED_MODEL,
        isFollowingWorkspaceTier: true,
        isAllowanceExhausted: true,
      }),
    ).toEqual({
      registeredModel: INCLUDED_MODEL,
      operationType: UsageOperationType.AI_CHAT_INCLUDED,
    });
  });

  it('keeps a picked paid tier billed once the allowance is exhausted, so it is refused rather than switched', () => {
    expect(
      selectAgentChatTurnModel({
        requestedModel: PAID_MODEL,
        includedModel: INCLUDED_MODEL,
        isFollowingWorkspaceTier: false,
        isAllowanceExhausted: true,
      }),
    ).toEqual({
      registeredModel: PAID_MODEL,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
    });
  });
});
