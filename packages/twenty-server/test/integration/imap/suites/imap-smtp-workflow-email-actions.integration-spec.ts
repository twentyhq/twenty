import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { ImapFlow } from 'imapflow';

import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import {
  type GreenmailServer,
  startGreenmailContainer,
} from 'test/integration/utils/start-greenmail-container.util';

const PASSWORD = 'greenmail-password';
const HANDLE = `imap-smtp-workflow-${randomUUID()}@acme.test`;

describe('IMAP/SMTP workflow email actions (integration)', () => {
  let greenmail: GreenmailServer;
  let connectedAccountId: string;
  let messageChannelId: string;

  const findDraftSubjects = async (): Promise<string[]> => {
    const client = new ImapFlow({
      host: greenmail.host,
      port: greenmail.imapPort,
      secure: false,
      auth: { user: HANDLE.split('@')[0], pass: PASSWORD },
      logger: false,
    });

    await client.connect();

    try {
      const { exists } = await client.mailboxOpen('Drafts');

      if (exists === 0) {
        return [];
      }

      const subjects: string[] = [];

      for await (const message of client.fetch('1:*', { envelope: true })) {
        const subject = message.envelope?.subject;

        if (isNonEmptyString(subject)) {
          subjects.push(subject);
        }
      }

      return subjects;
    } finally {
      await client.logout();
    }
  };

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: false },
    });

    greenmail = await startGreenmailContainer({
      username: HANDLE,
      password: PASSWORD,
    });

    const { data } = await saveImapSmtpCaldavAccount({
      input: {
        handle: HANDLE,
        connectionParameters: {
          IMAP: {
            host: greenmail.host,
            port: greenmail.imapPort,
            username: HANDLE.split('@')[0],
            password: PASSWORD,
            connectionSecurity: EmailConnectionSecurity.NONE,
          },
          SMTP: {
            host: greenmail.host,
            port: greenmail.smtpPort,
            username: HANDLE.split('@')[0],
            password: PASSWORD,
            connectionSecurity: EmailConnectionSecurity.NONE,
          },
        },
      },
      expectToFail: false,
    });

    connectedAccountId = data.connectedAccountId;
    messageChannelId = (
      await getCoreRepository<MessageChannelEntity>(
        MessageChannelEntity,
      ).findOneByOrFail({ connectedAccountId })
    ).id;

    await runMessageChannelSync(messageChannelId);
  }, 300000);

  afterAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: true },
    }).catch(() => undefined);

    if (isNonEmptyString(connectedAccountId)) {
      await deleteConnectedAccount({
        id: connectedAccountId,
        expectToFail: false,
      }).catch(() => undefined);
    }

    await greenmail?.stop().catch(() => undefined);
  });

  it('sends an email over SMTP from a SEND_EMAIL step and persists it', async () => {
    const subject = `IMAP/SMTP workflow send ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'IMAP/SMTP send email workflow',
      stepType: 'SEND_EMAIL',
      input: {
        connectedAccountId,
        recipients: {
          to: '{{trigger.to}}',
          cc: '{{trigger.cc}}',
          bcc: '{{trigger.bcc}}',
        },
        subject: '{{trigger.subject}}',
        body: '<p>SMTP workflow body</p>',
      },
      payload: { to: HANDLE, cc: HANDLE, bcc: HANDLE, subject },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      recipients: [HANDLE],
      ccRecipients: [HANDLE],
      bccRecipients: [HANDLE],
      subject,
      connectedAccountId,
      messageId: expect.any(String),
      messageThreadId: expect.any(String),
    });

    const [message] = await findRecordNodesByFilter<{
      id: string;
      isDraft: boolean;
      text: string | null;
    }>('message', 'messages', 'id isDraft text', {
      subject: { eq: subject },
    });

    expect(message).toMatchObject({
      isDraft: false,
      text: 'SMTP workflow body',
    });
    expect(
      await findRecordNodesByFilter<{ messageChannelId: string }>(
        'messageChannelMessageAssociation',
        'messageChannelMessageAssociations',
        'messageChannelId',
        { messageId: { eq: message.id } },
      ),
    ).toEqual([expect.objectContaining({ messageChannelId })]);
    expect(
      await findRecordNodesByFilter<{ handle: string; role: string }>(
        'messageParticipant',
        'messageParticipants',
        'handle role',
        { messageId: { eq: message.id } },
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ handle: HANDLE, role: 'TO' }),
        expect.objectContaining({ handle: HANDLE, role: 'CC' }),
        expect.objectContaining({ handle: HANDLE, role: 'BCC' }),
      ]),
    );
  }, 300000);

  it('appends a draft to the IMAP drafts folder from a DRAFT_EMAIL step without persisting it', async () => {
    const subject = `IMAP/SMTP workflow draft ${randomUUID()}`;

    const workflowRun = await runWorkflowActionStep({
      name: 'IMAP/SMTP draft email workflow',
      stepType: 'DRAFT_EMAIL',
      input: {
        connectedAccountId,
        recipients: { to: '{{trigger.to}}' },
        subject: '{{trigger.subject}}',
        body: '<p>SMTP workflow draft body</p>',
      },
      payload: { to: HANDLE, subject },
    });

    expect(workflowRun).toMatchObject({
      status: 'COMPLETED',
      stepStatus: 'SUCCESS',
    });
    expect(workflowRun.stepResult).toMatchObject({
      recipients: [HANDLE],
      subject,
      connectedAccountId,
    });
    expect(await findDraftSubjects()).toContain(subject);
    expect(
      await findRecordNodesByFilter<{ id: string }>(
        'message',
        'messages',
        'id',
        { subject: { eq: subject } },
      ),
    ).toEqual([]);
  }, 300000);
});
