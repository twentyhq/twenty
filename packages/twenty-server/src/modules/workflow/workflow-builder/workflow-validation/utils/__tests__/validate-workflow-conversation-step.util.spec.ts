import { WorkflowActionType } from 'twenty-shared/workflow';

import { validateWorkflowConversationStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-conversation-step.util';
import { type WorkflowSendChatMessageAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const buildStep = (
  conversation: WorkflowSendChatMessageAction['settings']['input']['conversation'],
): WorkflowSendChatMessageAction =>
  ({
    id: 'step-id',
    name: 'Send to Inbox',
    type: WorkflowActionType.SEND_CHAT_MESSAGE,
    valid: true,
    settings: {
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
      input: { workspaceMemberId: '', title: '', text: '', conversation },
    },
  }) as WorkflowSendChatMessageAction;

describe('validateWorkflowConversationStep', () => {
  it.each([undefined, { scope: 'RUN' as const }, { scope: 'STEP' as const }])(
    'accepts a conversation that needs no key: %o',
    (conversation) => {
      expect(validateWorkflowConversationStep(buildStep(conversation))).toEqual(
        [],
      );
    },
  );

  it('accepts a shared conversation with a key', () => {
    expect(
      validateWorkflowConversationStep(
        buildStep({ scope: 'KEY', key: '{{trigger.object.id}}' }),
      ),
    ).toEqual([]);
  });

  it.each([undefined, '', '   '])(
    'blocks activation of a shared conversation without a key: %o',
    (key) => {
      expect(
        validateWorkflowConversationStep(buildStep({ scope: 'KEY', key })),
      ).toEqual([
        expect.objectContaining({
          code: 'CONVERSATION_MISSING_KEY',
          severity: 'error',
          stepId: 'step-id',
        }),
      ]);
    },
  );
});
