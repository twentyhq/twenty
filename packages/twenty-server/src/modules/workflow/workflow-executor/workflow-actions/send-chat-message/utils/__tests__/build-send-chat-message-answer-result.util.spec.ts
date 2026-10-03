import { buildSendChatMessageAnswerResult } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/utils/build-send-chat-message-answer-result.util';

const EMAIL_ARGUMENTS = {
  recipients: { to: 'team@acme.com' },
  subject: 'Recap',
  body: '<p>Recap</p>',
};

const buildResult = (result: Record<string, unknown>) =>
  buildSendChatMessageAnswerResult({
    threadId: 'thread-id',
    toolResult: { success: true, result },
  });

describe('buildSendChatMessageAnswerResult', () => {
  it.each(['send_email', 'draft_email'])(
    'tells later steps the member approved %s',
    (toolName) => {
      expect(
        buildResult({
          status: 'approved',
          proposal: { toolName, arguments: EMAIL_ARGUMENTS },
          output: { messageId: 'message-id' },
        }),
      ).toEqual({
        threadId: 'thread-id',
        isApproved: true,
        approvedToolName: toolName,
        status: 'approved',
        arguments: EMAIL_ARGUMENTS,
        output: { messageId: 'message-id' },
        feedback: null,
        error: null,
      });
    },
  );

  it('counts an approved call that failed as approved', () => {
    expect(
      buildResult({
        status: 'failed',
        proposal: { toolName: 'send_email', arguments: EMAIL_ARGUMENTS },
        error: 'No connected account',
      }),
    ).toMatchObject({
      isApproved: true,
      approvedToolName: 'send_email',
      status: 'failed',
      error: 'No connected account',
    });
  });

  it('names no action when the member rejects the call', () => {
    expect(
      buildResult({
        status: 'rejected',
        proposal: { toolName: 'send_email', arguments: EMAIL_ARGUMENTS },
        feedback: 'Not yet',
      }),
    ).toMatchObject({
      isApproved: false,
      approvedToolName: null,
      feedback: 'Not yet',
    });
  });
});
