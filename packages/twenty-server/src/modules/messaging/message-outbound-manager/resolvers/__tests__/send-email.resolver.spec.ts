import { type MessageDescriptor } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';

import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import {
  EmailToolException,
  EmailToolExceptionCode,
} from 'src/engine/core-modules/tool/tools/email-tool/exceptions/email-tool.exception';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type SendEmailInput } from 'src/modules/messaging/message-outbound-manager/dtos/send-email.input';
import { SendEmailResolver } from 'src/modules/messaging/message-outbound-manager/resolvers/send-email.resolver';

const WORKSPACE_ID = '33333333-3333-4333-8333-333333333333';
const USER_WORKSPACE_ID = '66666666-6666-4666-8666-666666666666';

describe('SendEmailResolver errors', () => {
  const workspace = { id: WORKSPACE_ID } as WorkspaceEntity;
  const context: I18nContext = { req: { locale: 'fr-FR' } };
  const input = {
    connectedAccountId: 'connected-account-id',
    to: 'recipient@example.com',
    subject: 'Subject',
    body: '<p>body</p>',
  } as SendEmailInput;

  const buildResolver = (composeEmail: jest.Mock) => {
    const i18nService = {
      getI18nInstance: jest.fn((locale: string) => ({
        _: (descriptor: MessageDescriptor) => `${locale}:${descriptor.message}`,
      })),
    };

    const resolver = new SendEmailResolver(
      { verifyUsableByCaller: jest.fn() } as never,
      { composeEmail } as never,
      {} as never,
      {} as never,
      {} as never,
      i18nService as never,
    );

    return { resolver, i18nService };
  };

  it('translates a composition failure for the request locale', async () => {
    const { resolver } = buildResolver(
      jest.fn().mockResolvedValue({
        success: false,
        error: { id: 'no-recipients', message: 'No recipients specified' },
      }),
    );

    const result = await resolver.sendEmail(
      input,
      workspace,
      USER_WORKSPACE_ID,
      context,
    );

    expect(result).toEqual({
      success: false,
      error: 'fr-FR:No recipients specified',
    });
  });

  it('returns the translated user-friendly message of a custom exception', async () => {
    const exception = new EmailToolException(
      'No connected account in this workspace can send email',
      EmailToolExceptionCode.NO_EMAIL_CAPABLE_CONNECTED_ACCOUNT,
    );
    const { resolver } = buildResolver(jest.fn().mockRejectedValue(exception));

    const result = await resolver.sendEmail(
      input,
      workspace,
      USER_WORKSPACE_ID,
      context,
    );

    expect(result).toEqual({
      success: false,
      error: `fr-FR:${exception.userFriendlyMessage.message}`,
    });
  });

  it('returns no error text for an unexpected error so the client shows its fallback', async () => {
    const { resolver } = buildResolver(
      jest.fn().mockRejectedValue(new Error('connect ECONNREFUSED 10.0.0.1')),
    );

    const result = await resolver.sendEmail(
      input,
      workspace,
      USER_WORKSPACE_ID,
      context,
    );

    expect(result).toStrictEqual({ success: false });
  });
});

const AUTH_CONTEXT = { workspace: { id: WORKSPACE_ID } };

jest.mock(
  'src/engine/core-modules/auth/storage/workspace-auth-context.storage',
  () => ({ getWorkspaceAuthContext: () => AUTH_CONTEXT }),
);

describe('SendEmailResolver target record linking', () => {
  const workspace = { id: WORKSPACE_ID } as WorkspaceEntity;
  const context: I18nContext = { req: { locale: 'en' } };
  const baseInput = {
    connectedAccountId: 'connected-account-id',
    to: 'recipient@example.com',
    subject: 'Subject',
    body: '<p>body</p>',
  } as SendEmailInput;

  const buildResolver = ({
    persistedMessageThreadId,
  }: {
    persistedMessageThreadId?: string;
  }) => {
    const linkSentMessageThreadToRecord = jest.fn();

    const resolver = new SendEmailResolver(
      { verifyUsableByCaller: jest.fn() } as never,
      {
        composeEmail: jest.fn().mockResolvedValue({
          success: true,
          data: { shouldPersistMessage: true },
        }),
      } as never,
      { deleteFiles: jest.fn() } as never,
      {
        sendComposedEmail: jest.fn().mockResolvedValue({}),
        persistSentMessage: jest.fn().mockResolvedValue(
          isDefined(persistedMessageThreadId)
            ? {
                messageId: 'message-id',
                messageThreadId: persistedMessageThreadId,
              }
            : undefined,
        ),
      } as never,
      { linkSentMessageThreadToRecord } as never,
      {} as never,
    );

    return { resolver, linkSentMessageThreadToRecord };
  };

  it('links the sent thread to the record the email was sent from', async () => {
    const { resolver, linkSentMessageThreadToRecord } = buildResolver({
      persistedMessageThreadId: 'message-thread-id',
    });

    const result = await resolver.sendEmail(
      {
        ...baseInput,
        targetRecord: {
          objectNameSingular: 'opportunity',
          recordId: 'opportunity-id',
        },
      },
      workspace,
      USER_WORKSPACE_ID,
      context,
    );

    expect(result).toEqual({ success: true, messageThreadId: undefined });
    expect(linkSentMessageThreadToRecord).toHaveBeenCalledWith({
      authContext: AUTH_CONTEXT,
      messageThreadId: 'message-thread-id',
      objectNameSingular: 'opportunity',
      recordId: 'opportunity-id',
    });
  });

  it('does not link anything without a target record', async () => {
    const { resolver, linkSentMessageThreadToRecord } = buildResolver({
      persistedMessageThreadId: 'message-thread-id',
    });

    await resolver.sendEmail(baseInput, workspace, USER_WORKSPACE_ID, context);

    expect(linkSentMessageThreadToRecord).not.toHaveBeenCalled();
  });

  it('does not link anything when the sent message could not be persisted', async () => {
    const { resolver, linkSentMessageThreadToRecord } = buildResolver({});

    await resolver.sendEmail(
      {
        ...baseInput,
        targetRecord: {
          objectNameSingular: 'opportunity',
          recordId: 'opportunity-id',
        },
      },
      workspace,
      USER_WORKSPACE_ID,
      context,
    );

    expect(linkSentMessageThreadToRecord).not.toHaveBeenCalled();
  });
});
