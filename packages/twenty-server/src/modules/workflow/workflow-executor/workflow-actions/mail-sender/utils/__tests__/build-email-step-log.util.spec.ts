import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';
import { buildEmailStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/build-email-step-log.util';

const baseInput: WorkflowSendEmailActionInput = {
  connectedAccountId: 'account-1',
  recipients: { to: 'alice@example.com, bob@example.com' },
  subject: 'Welcome',
  body: '<p>Hello</p>',
};

const successOutput: ToolOutput = {
  success: true,
  message: 'Email sent successfully to Alice',
  result: {
    recipients: ['alice@example.com', 'bob@example.com'],
    ccRecipients: [],
    bccRecipients: [],
    subject: 'Welcome',
    connectedAccountId: 'account-1',
    attachmentCount: 0,
  },
};

describe('buildEmailStepLog', () => {
  it('builds a SUCCESS email log preferring parsed recipients from the tool output', () => {
    const stepLog = buildEmailStepLog({
      mode: 'SEND',
      input: baseInput,
      output: successOutput,
      durationMs: 120,
    });

    if (stepLog.details.type !== 'EMAIL') {
      throw new Error('Expected EMAIL details');
    }

    expect(stepLog.details.mode).toBe('SEND');
    expect(stepLog.details.status).toBe('SUCCESS');
    expect(stepLog.details.recipients.to).toEqual([
      'alice@example.com',
      'bob@example.com',
    ]);
    expect(stepLog.details.recipients.cc).toBeUndefined();
    expect(stepLog.details.subject).toBe('Welcome');
    expect(stepLog.details.attachmentCount).toBe(0);
    expect(stepLog.details.durationMs).toBe(120);
  });

  it('falls back to splitting the comma-separated input when the tool output has no parsed recipients', () => {
    const stepLog = buildEmailStepLog({
      mode: 'DRAFT',
      input: {
        ...baseInput,
        recipients: {
          to: 'alice@example.com,bob@example.com ; carol@example.com',
          cc: 'dan@example.com',
        },
      },
      output: {
        success: false,
        message: 'Failed to create draft',
        error: 'Connected account expired',
      },
      durationMs: 5,
    });

    if (stepLog.details.type !== 'EMAIL') {
      throw new Error('Expected EMAIL details');
    }

    expect(stepLog.details.mode).toBe('DRAFT');
    expect(stepLog.details.status).toBe('ERROR');
    expect(stepLog.details.recipients.to).toEqual([
      'alice@example.com',
      'bob@example.com',
      'carol@example.com',
    ]);
    expect(stepLog.details.recipients.cc).toEqual(['dan@example.com']);
    expect(stepLog.details.error).toBe('Connected account expired');
  });

  it('truncates oversized body previews and reports original byte size', () => {
    const longBody = `<p>${'x'.repeat(20_000)}</p>`;

    const stepLog = buildEmailStepLog({
      mode: 'SEND',
      input: { ...baseInput, body: longBody },
      output: successOutput,
      durationMs: 10,
    });

    if (stepLog.details.type !== 'EMAIL') {
      throw new Error('Expected EMAIL details');
    }

    expect(stepLog.details.bodyTruncated).toBe(true);
    expect(stepLog.details.bodyPreview).toContain('truncated');
    expect(stepLog.details.bodyBytes).toBeGreaterThan(20_000);
  });

  it('prefers the sanitized HTML body from the tool output over the raw input body', () => {
    const stepLog = buildEmailStepLog({
      mode: 'SEND',
      input: {
        ...baseInput,
        body: '<script>alert("xss")</script><p>Hello</p>',
      },
      output: {
        ...successOutput,
        result: {
          ...(successOutput.result as object),
          sanitizedHtmlBody: '<p>Hello</p>',
          plainTextBody: 'Hello',
        },
      },
      durationMs: 10,
    });

    if (stepLog.details.type !== 'EMAIL') {
      throw new Error('Expected EMAIL details');
    }

    expect(stepLog.details.bodyPreview).toBe('<p>Hello</p>');
    expect(stepLog.details.bodyPreview).not.toContain('<script>');
  });

  it('falls back to the raw input body when the tool failed before composing', () => {
    const stepLog = buildEmailStepLog({
      mode: 'SEND',
      input: { ...baseInput, body: '<p>Hello</p>' },
      output: {
        success: false,
        message: 'Failed to send',
        error: 'Auth expired',
      },
      durationMs: 5,
    });

    if (stepLog.details.type !== 'EMAIL') {
      throw new Error('Expected EMAIL details');
    }

    expect(stepLog.details.bodyPreview).toBe('<p>Hello</p>');
  });

  it('omits cc/bcc when neither input nor output provides them', () => {
    const stepLog = buildEmailStepLog({
      mode: 'SEND',
      input: { ...baseInput, recipients: { to: 'alice@example.com' } },
      output: successOutput,
      durationMs: 10,
    });

    if (stepLog.details.type !== 'EMAIL') {
      throw new Error('Expected EMAIL details');
    }

    expect(stepLog.details.recipients.cc).toBeUndefined();
    expect(stepLog.details.recipients.bcc).toBeUndefined();
  });
});
