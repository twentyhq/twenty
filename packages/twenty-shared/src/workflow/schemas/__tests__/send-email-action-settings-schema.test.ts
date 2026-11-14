import { workflowSendEmailActionSettingsSchema } from '../send-email-action-settings-schema';

const buildSettings = (body: string | undefined) => ({
  input: {
    connectedAccountId: 'account-id',
    recipients: { to: 'ada@acme.com' },
    body,
  },
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: 0 },
    continueOnFailure: { value: false },
  },
});

describe('workflowSendEmailActionSettingsSchema', () => {
  it.each([undefined, ''])('accepts a step without a body: %p', (body) => {
    expect(
      workflowSendEmailActionSettingsSchema.safeParse(buildSettings(body))
        .success,
    ).toBe(true);
  });

  it('accepts a serialized email document', () => {
    const body = JSON.stringify({
      type: 'doc',
      attrs: { schemaVersion: 1 },
      content: [{ type: 'htmlDocument', attrs: { html: '{{code.html}}' } }],
    });

    expect(
      workflowSendEmailActionSettingsSchema.safeParse(buildSettings(body))
        .success,
    ).toBe(true);
  });

  it.each(['<p>Hello {{trigger.name}}</p>', 'Hello\nBye', '{{code.html}}'])(
    'rejects a body that is not a serialized email document: %s',
    (body) => {
      expect(
        workflowSendEmailActionSettingsSchema.safeParse(buildSettings(body))
          .success,
      ).toBe(false);
    },
  );
});
