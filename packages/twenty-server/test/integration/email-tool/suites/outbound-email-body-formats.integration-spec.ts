import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import {
  convertPlainTextToEmailDocument,
  EMAIL_DOCUMENT_SCHEMA_VERSION,
  type EmailDocument,
  parseCanonicalEmailDocument,
  parseJson,
} from 'twenty-shared/utils';

import { type ConvertWorkflowEmailBodiesToEmailDocumentsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791184540980-convert-workflow-email-bodies-to-email-documents.command';
import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { type SendEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/send-email-tool';
import { type EmailToolInput } from 'src/engine/core-modules/tool/tools/email-tool/types/email-tool-input.type';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PROPOSE_EMAIL_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/propose-email.pausing-tool';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

import {
  runWorkflowActionStep,
  type WorkflowActionStepRun,
} from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { sendEmail } from 'test/integration/utils/send-email.util';
import {
  type GreenmailServer,
  startGreenmailContainer,
} from 'test/integration/utils/start-greenmail-container.util';

const PASSWORD = 'greenmail-password';
const HANDLE = `email-body-formats-${randomUUID()}@acme.test`;
const EMAIL_SHELL_MARKER = 'x-apple-disable-message-reformatting';

type ComposedBody = { sanitizedHtmlBody: string; plainTextBody: string };

const paragraphDocument = (text: string): EmailDocument => ({
  type: 'doc',
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});

const findPersistedMessageText = async (subject: string) => {
  const [message] = await findRecordNodesByFilter<{ text: string | null }>(
    'message',
    'messages',
    'text',
    { subject: { eq: subject } },
  );

  return message?.text;
};

const getAppleWorkspaceSchema = async (): Promise<string> => {
  const [{ databaseSchema }] = await global.testDataSource.query(
    `SELECT "databaseSchema" FROM core."workspace" WHERE "id" = $1`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return databaseSchema;
};

const EMAIL_STEP_BODY_PATH = `jsonb_path_query_first(steps, '$[*] ? (@.type == "SEND_EMAIL" || @.type == "DRAFT_EMAIL").settings.input.body') #>> '{}'`;

const readStoredBodies = async (workflowVersionId: string) => {
  const workspaceSchema = await getAppleWorkspaceSchema();
  const [workspaceRow] = await global.testDataSource.query(
    `SELECT ${EMAIL_STEP_BODY_PATH} AS body FROM "${workspaceSchema}"."workflowVersion" WHERE "id" = $1`,
    [workflowVersionId],
  );
  const [coreRow] = await global.testDataSource.query(
    `SELECT ${EMAIL_STEP_BODY_PATH} AS body FROM core."workflowVersion" WHERE "workspaceWorkflowVersionId" = $1`,
    [workflowVersionId],
  );

  return { workspaceBody: workspaceRow.body, coreBody: coreRow.body };
};

const storeBodyAsBeforeTheUpgrade = async (
  workflowVersionId: string,
  legacyBody: string,
) => {
  const workspaceSchema = await getAppleWorkspaceSchema();
  const replaceEmailStepBody = `steps = (
    SELECT jsonb_agg(
      CASE WHEN step->>'type' IN ('SEND_EMAIL', 'DRAFT_EMAIL')
        THEN jsonb_set(step, '{settings,input,body}', to_jsonb($1::text))
        ELSE step END)
    FROM jsonb_array_elements(steps) step)`;

  await global.testDataSource.query(
    `UPDATE "${workspaceSchema}"."workflowVersion" SET ${replaceEmailStepBody} WHERE "id" = $2`,
    [legacyBody, workflowVersionId],
  );
  await global.testDataSource.query(
    `UPDATE core."workflowVersion" SET ${replaceEmailStepBody} WHERE "workspaceWorkflowVersionId" = $2`,
    [legacyBody, workflowVersionId],
  );
};

describe('Outbound email body formats (integration)', () => {
  let greenmail: GreenmailServer;
  let connectedAccountId: string;

  const runSendEmailWorkflow = async ({
    body,
    payload = {},
    stepType = 'SEND_EMAIL',
    beforeRun,
  }: {
    body: EmailDocument | string;
    payload?: Record<string, unknown>;
    stepType?: 'SEND_EMAIL' | 'DRAFT_EMAIL';
    beforeRun?: (workflowVersionId: string) => Promise<void>;
  }): Promise<ComposedBody & { run: WorkflowActionStepRun }> => {
    const run = await runWorkflowActionStep({
      name: `Email body format ${randomUUID()}`,
      stepType,
      input: {
        connectedAccountId,
        recipients: { to: HANDLE, cc: '', bcc: '' },
        subject: `Email body format ${randomUUID()}`,
        body: typeof body === 'string' ? '' : JSON.stringify(body),
      },
      payload,
      beforeRun: async (workflowVersionId) => {
        if (typeof body === 'string') {
          await storeBodyAsBeforeTheUpgrade(workflowVersionId, body);
        }

        await beforeRun?.(workflowVersionId);
      },
    });

    expect(run).toMatchObject({ status: 'COMPLETED', stepStatus: 'SUCCESS' });

    return { ...(run.stepResult as ComposedBody), run };
  };

  const executeSendEmailTool = async (body: EmailToolInput['body']) => {
    const sendEmailTool =
      getAppProviderByClassName<SendEmailTool>('SendEmailTool');
    const subject = `Email tool body format ${randomUUID()}`;

    const output = await sendEmailTool.execute(
      {
        recipients: { to: HANDLE, cc: '', bcc: '' },
        subject,
        body,
        connectedAccountId,
        files: [],
      },
      {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      },
    );

    expect(output.success).toBe(true);

    return { ...(output.result as ComposedBody), subject };
  };

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: ['*'] },
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

    await runMessageChannelSync(
      (
        await getCoreRepository<MessageChannelEntity>(
          MessageChannelEntity,
        ).findOneByOrFail({ connectedAccountId })
      ).id,
    );
  }, 300000);

  afterAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: [] },
    }).catch(() => undefined);

    if (isNonEmptyString(connectedAccountId)) {
      await deleteConnectedAccount({
        id: connectedAccountId,
        expectToFail: false,
      }).catch(() => undefined);
    }

    await greenmail?.stop().catch(() => undefined);
  });

  describe('workflow email body stored as a document', () => {
    it('renders a versionless email document', async () => {
      const { sanitizedHtmlBody, plainTextBody } = await runSendEmailWorkflow({
        body: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Stored before versioning' }],
            },
          ],
        },
      });

      expect(sanitizedHtmlBody).toContain(EMAIL_SHELL_MARKER);
      expect(plainTextBody).toBe('Stored before versioning');
    }, 300000);

    it('renders rich text around an HTML block and fills the variables inside it', async () => {
      const { sanitizedHtmlBody, plainTextBody } = await runSendEmailWorkflow({
        body: {
          type: 'doc',
          attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Rich text above',
                  marks: [{ type: 'bold' }],
                },
              ],
            },
            {
              type: 'html',
              attrs: {
                html: '<table><tr><td style="color:red">Hi {{trigger.firstName}} {{trigger.lastName}}</td></tr></table>',
              },
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Rich text below' }],
            },
          ],
        },
        payload: { firstName: 'Ada', lastName: 'Lovelace' },
      });

      expect(sanitizedHtmlBody).toContain('<strong>Rich text above</strong>');
      expect(sanitizedHtmlBody).toContain(
        '<td style="color:red">Hi Ada Lovelace</td>',
      );
      expect(plainTextBody).toBe(
        'Rich text above\n\nHi Ada Lovelace\n\nRich text below',
      );
    }, 300000);

    it('keeps the paragraphs of a draft body written as lines of text', async () => {
      const { sanitizedHtmlBody, plainTextBody } = await runSendEmailWorkflow({
        body: convertPlainTextToEmailDocument(
          'Draft line one\n\nDraft line two',
        ),
        stepType: 'DRAFT_EMAIL',
      });

      expect(sanitizedHtmlBody).toContain(
        'Draft line one<br><br>Draft line two',
      );
      expect(plainTextBody).toBe('Draft line one\n\nDraft line two');
    }, 300000);
  });

  describe('workflow email body stored as a string before the upgrade', () => {
    it('keeps the paragraphs of a plain-text body and escapes its variable values', async () => {
      const { sanitizedHtmlBody, plainTextBody } = await runSendEmailWorkflow({
        body: 'Hi {{trigger.name}},\n\nSee you soon\nJane',
        payload: { name: 'Tom & <Jerry>' },
      });

      expect(sanitizedHtmlBody).toContain(
        'Hi Tom &amp; &lt;Jerry&gt;,<br><br>See you soon<br>Jane',
      );
      expect(plainTextBody).toBe('Hi Tom & <Jerry>,\n\nSee you soon\nJane');
    }, 300000);

    it('injects variable values raw into a legacy HTML body and sends it without the email shell', async () => {
      const { sanitizedHtmlBody, plainTextBody } = await runSendEmailWorkflow({
        body: '<p>Hello {{trigger.name}}</p><script>alert(1)</script>',
        payload: { name: '<b>Ada</b>' },
      });

      expect(sanitizedHtmlBody).toBe('<p>Hello <b>Ada</b></p>');
      expect(plainTextBody).toBe('Hello Ada');
    }, 300000);

    it('treats a body with markup after the first word as HTML', async () => {
      const { sanitizedHtmlBody, plainTextBody } = await runSendEmailWorkflow({
        body: 'Hi {{trigger.name}},<br><br>Thanks',
        payload: { name: 'Ada' },
      });

      expect(sanitizedHtmlBody).toBe('Hi Ada,<br><br>Thanks');
      expect(plainTextBody).toBe('Hi Ada,\n\nThanks');
    }, 300000);

    it('sends the HTML held by a body that is a single variable verbatim', async () => {
      const { sanitizedHtmlBody } = await runSendEmailWorkflow({
        body: '{{trigger.html}}',
        payload: { html: '<h1>Weekly report</h1><p>All good</p>' },
      });

      expect(sanitizedHtmlBody).toBe('<h1>Weekly report</h1><p>All good</p>');
    }, 300000);

    it('sends a full HTML document body without wrapping it in the email shell', async () => {
      const { sanitizedHtmlBody, plainTextBody } = await runSendEmailWorkflow({
        body: '<!DOCTYPE html><html><body><p>Full document</p></body></html>',
      });

      expect(sanitizedHtmlBody).not.toContain(EMAIL_SHELL_MARKER);
      expect(plainTextBody).toBe('Full document');
    }, 300000);
  });

  describe('send_email tool', () => {
    it('keeps the paragraphs of a plain-text body and persists them', async () => {
      const { plainTextBody, subject } = await executeSendEmailTool(
        'Dear Nick,\n\nThanks for the call.\nBest,\nJane',
      );

      expect(plainTextBody).toBe(
        'Dear Nick,\n\nThanks for the call.\nBest,\nJane',
      );
      expect(await findPersistedMessageText(subject)).toBe(plainTextBody);
    }, 300000);

    it('sends an HTML string verbatim', async () => {
      const { sanitizedHtmlBody } = await executeSendEmailTool(
        '<p>Hello <strong>Ada</strong></p>',
      );

      expect(sanitizedHtmlBody).toBe('<p>Hello <strong>Ada</strong></p>');
    }, 300000);

    it('renders an email document object', async () => {
      const { sanitizedHtmlBody, plainTextBody } = await executeSendEmailTool(
        paragraphDocument('From the tool'),
      );

      expect(sanitizedHtmlBody).toContain(EMAIL_SHELL_MARKER);
      expect(plainTextBody).toBe('From the tool');
    }, 300000);

    it('fails on an email document with a node outside the email schema', async () => {
      const sendEmailTool =
        getAppProviderByClassName<SendEmailTool>('SendEmailTool');
      const subject = `Invalid body ${randomUUID()}`;

      const output = await sendEmailTool.execute(
        {
          recipients: { to: HANDLE, cc: '', bcc: '' },
          subject,
          body: { type: 'doc', content: [{ type: 'unknownBlock' }] },
          connectedAccountId,
          files: [],
        } as EmailToolInput,
        {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        },
      );

      expect(output).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid outbound email document'),
      });
      expect(await findPersistedMessageText(subject)).toBeUndefined();
    }, 300000);
  });

  describe('propose_email approval', () => {
    it('sends the approved plain-text email with its paragraphs', async () => {
      const sendEmailTool =
        getAppProviderByClassName<SendEmailTool>('SendEmailTool');
      const subject = `Approved email ${randomUUID()}`;
      const email = {
        recipients: { to: HANDLE, cc: '', bcc: '' },
        subject,
        body: 'Hi Tim,\nThanks for renewing.\n\nBest, Jane',
        connectedAccountId,
      };
      const call = PROPOSE_EMAIL_PAUSING_TOOL.parseCall(email);

      expect(call).not.toBeNull();

      const completion = await call!.complete({
        output: { decision: 'send', email },
        context: {
          executeTool: ({ args }) =>
            sendEmailTool.execute(args as EmailToolInput, {
              workspaceId: SEED_APPLE_WORKSPACE_ID,
              userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
            }),
        },
      });

      expect(completion.toolResult.success).toBe(true);
      expect(await findPersistedMessageText(subject)).toBe(
        'Hi Tim,\nThanks for renewing.\n\nBest, Jane',
      );
    }, 300000);
  });

  describe('sendEmail mutation', () => {
    it('keeps the paragraphs of a plain-text body', async () => {
      const subject = `Mutation plain text ${randomUUID()}`;

      const result = await sendEmail({
        connectedAccountId,
        to: HANDLE,
        subject,
        body: 'Line one\n\nLine two',
      });

      expect(result.success).toBe(true);
      expect(await findPersistedMessageText(subject)).toBe(
        'Line one\n\nLine two',
      );
    }, 300000);

    it('renders a serialized email document from the composer', async () => {
      const subject = `Mutation document ${randomUUID()}`;

      const result = await sendEmail({
        connectedAccountId,
        to: HANDLE,
        subject,
        body: JSON.stringify(paragraphDocument('From the composer')),
      });

      expect(result.success).toBe(true);
      expect(await findPersistedMessageText(subject)).toBe('From the composer');
    }, 300000);

    it('sends a composer email the user never typed into', async () => {
      const result = await sendEmail({
        connectedAccountId,
        to: HANDLE,
        subject: `Mutation empty ${randomUUID()}`,
        body: '',
      });

      expect(result.success).toBe(true);
    }, 300000);
  });

  describe('upgrade command', () => {
    const runUpgradeCommand = (dryRun: boolean) =>
      getAppProviderByClassName<ConvertWorkflowEmailBodiesToEmailDocumentsCommand>(
        'ConvertWorkflowEmailBodiesToEmailDocumentsCommand',
      ).runOnWorkspace({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        options: { dryRun },
        index: 0,
        total: 1,
        dataSource: global.testDataSource,
      });

    const convertStoredBodyBeforeRun =
      (legacyBody: string) => async (workflowVersionId: string) => {
        expect(await readStoredBodies(workflowVersionId)).toEqual({
          workspaceBody: legacyBody,
          coreBody: legacyBody,
        });

        await runUpgradeCommand(true);

        expect(await readStoredBodies(workflowVersionId)).toEqual({
          workspaceBody: legacyBody,
          coreBody: legacyBody,
        });

        await runUpgradeCommand(false);

        const convertedBodies = await readStoredBodies(workflowVersionId);

        expect(convertedBodies.coreBody).toBe(convertedBodies.workspaceBody);
        expect(
          parseCanonicalEmailDocument(
            parseJson<unknown>(convertedBodies.workspaceBody),
          ).success,
        ).toBe(true);

        await runUpgradeCommand(false);

        expect(await readStoredBodies(workflowVersionId)).toEqual(
          convertedBodies,
        );
      };

    it.each([
      {
        kind: 'plain text with variables',
        body: 'Hi {{trigger.name}},\n\nSee you soon',
        payload: { name: 'Tom & <Jerry>' },
      },
      {
        kind: 'HTML with raw variable values',
        body: '<p>Hello {{trigger.name}}</p>',
        payload: { name: '<b>Ada</b>' },
      },
      {
        kind: 'a single variable holding HTML',
        body: '{{trigger.html}}',
        payload: { html: '<h1>Report</h1><p>All good</p>' },
      },
      {
        kind: 'a versionless document',
        body: JSON.stringify({
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
          ],
        }),
        payload: {},
      },
    ])(
      'sends the same email from a stored body made of $kind before and after the upgrade',
      async ({ body, payload }) => {
        const beforeUpgrade = await runSendEmailWorkflow({
          body,
          payload,
        });
        const afterUpgrade = await runSendEmailWorkflow({
          body,
          payload,
          beforeRun: convertStoredBodyBeforeRun(body),
        });

        expect(afterUpgrade.sanitizedHtmlBody).toBe(
          beforeUpgrade.sanitizedHtmlBody,
        );
        expect(afterUpgrade.plainTextBody).toBe(beforeUpgrade.plainTextBody);
      },
      600000,
    );
  });
});
