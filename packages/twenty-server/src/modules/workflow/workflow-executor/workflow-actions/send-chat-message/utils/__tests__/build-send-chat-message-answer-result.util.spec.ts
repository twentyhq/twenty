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
    'reports %s as executed once approved',
    (toolName) => {
      expect(
        buildResult({
          status: 'approved',
          proposal: { toolName, arguments: EMAIL_ARGUMENTS },
          output: { messageId: 'message-id' },
        }),
      ).toEqual({
        threadId: 'thread-id',
        outcome: 'executed',
        toolName,
        arguments: EMAIL_ARGUMENTS,
        output: { messageId: 'message-id' },
        feedback: null,
        error: null,
      });
    },
  );

  it('keeps the error of an approved call that failed', () => {
    expect(
      buildResult({
        status: 'failed',
        proposal: { toolName: 'send_email', arguments: EMAIL_ARGUMENTS },
        error: 'No connected account',
      }),
    ).toMatchObject({
      outcome: 'failed',
      toolName: 'send_email',
      output: null,
      error: 'No connected account',
    });
  });

  it('keeps the latest values of a record that changed before approval', () => {
    expect(
      buildResult({
        status: 'conflict',
        proposal: { toolName: 'update_one_company', arguments: {} },
        output: { latestValues: { employees: 12 } },
      }),
    ).toMatchObject({
      outcome: 'conflict',
      output: { latestValues: { employees: 12 } },
    });
  });

  it('keeps the feedback of a rejected call', () => {
    expect(
      buildResult({
        status: 'rejected',
        proposal: { toolName: 'send_email', arguments: EMAIL_ARGUMENTS },
        feedback: 'Not yet',
      }),
    ).toMatchObject({
      outcome: 'rejected',
      toolName: 'send_email',
      feedback: 'Not yet',
    });
  });

  it.each(['pending', 'running', 'skipped', undefined])(
    'refuses to report a %s call',
    (status) => {
      expect(() =>
        buildResult({
          status,
          proposal: { toolName: 'send_email', arguments: EMAIL_ARGUMENTS },
        }),
      ).toThrow('The answer to the action could not be read');
    },
  );
});
