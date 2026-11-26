import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import {
  EMAIL_DOCUMENT_SCHEMA_VERSION,
  type EmailDocument,
  EMPTY_EMAIL_DOCUMENT,
  parseCanonicalEmailDocument,
  parseJson,
} from 'twenty-shared/utils';

import { type ConvertWorkflowEmailBodiesToEmailDocumentsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791811310066-convert-workflow-email-bodies-to-email-documents.command';
import { type BackfillEmptyWorkflowEmailBodiesCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-workspace-command-1794734527065-backfill-empty-workflow-email-bodies.command';
import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { type SendEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/send-email-tool';
import { type EmailToolInput } from 'src/engine/core-modules/tool/tools/email-tool/types/email-tool-input.type';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

import {
  runWorkflowActionStep,
  type WorkflowActionStepRun,
} from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { buildEmailDocument } from 'test/integration/utils/build-email-document.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { sendEmail } from 'test/integration/utils/send-email.util';
import {
  type GreenmailServer,
  startGreenmailContainer,
} from 'test/integration/utils/start-greenmail-container.util';
import {
  grantRoleWideAccessToChannelObjects,
  revokeRoleWideAccessToChannelObjects,
} from 'test/integration/utils/role-wide-access-to-channel-objects.util';

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

const EMAIL_STEP_BODY_PATH = `jsonb_path_query_first(steps, '$[*] ? (@.type == "SEND_EMAIL" || @.type == "DRAFT_EMAIL").settings.input.body') #>> '{}'`;

const readStoredBodies = async (coreWorkflowVersionId: string) => {
  const [coreRow] = await global.testDataSource.query(
    `SELECT ${EMAIL_STEP_BODY_PATH} AS body FROM core."workflowVersion" WHERE "id" = $1`,
    [coreWorkflowVersionId],
  );

  return { coreBody: coreRow.body };
};

const storeBodyAsBeforeTheUpgrade = async (
  coreWorkflowVersionId: string,
  legacyBody: string,
) => {
  const replaceEmailStepBody = `steps = (
    SELECT jsonb_agg(
      CASE WHEN step->>'type' IN ('SEND_EMAIL', 'DRAFT_EMAIL')
        THEN jsonb_set(step, '{settings,input,body}', to_jsonb($1::text))
        ELSE step END)
    FROM jsonb_array_elements(steps) step)`;

  await global.testDataSource.query(
    `UPDATE core."workflowVersion" SET ${replaceEmailStepBody} WHERE "id" = $2`,
    [legacyBody, coreWorkflowVersionId],
  );
};

describe('Outbound email body formats (integration)', () => {
  let greenmail: GreenmailServer;
  let connectedAccountId: string;

  type EmailBodyWorkflowArgs = {
    body: EmailDocument | string;
    payload?: Record<string, unknown>;
    stepType?: 'SEND_EMAIL' | 'DRAFT_EMAIL';
    beforeRun?: (coreWorkflowVersionId: string) => Promise<void>;
  };

  const runEmailBodyWorkflow = ({
    body,
    payload = {},
    stepType = 'SEND_EMAIL',
    beforeRun,
  }: EmailBodyWorkflowArgs): Promise<WorkflowActionStepRun> =>
    runWorkflowActionStep({
      name: `Email body format ${randomUUID()}`,
      stepType,
      input: {
        connectedAccountId,
        recipients: { to: HANDLE, cc: '', bcc: '' },
        subject: `Email body format ${randomUUID()}`,
        body: JSON.stringify(
          typeof body === 'string' ? EMPTY_EMAIL_DOCUMENT : body,
        ),
      },
      payload,
      beforeRun: async (coreWorkflowVersionId) => {
        if (typeof body === 'string') {
          await storeBodyAsBeforeTheUpgrade(coreWorkflowVersionId, body);
        }

        await beforeRun?.(coreWorkflowVersionId);
      },
    });

  const runSendEmailWorkflow = async (
    args: EmailBodyWorkflowArgs,
  ): Promise<ComposedBody & { run: WorkflowActionStepRun }> => {
    const run = await runEmailBodyWorkflow(args);

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
    await grantRoleWideAccessToChannelObjects();
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
    await revokeRoleWideAccessToChannelObjects();
  });

  describe('workflow email body stored as a document', () => {
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
        body: buildEmailDocument('Draft line one\n\nDraft line two'),
        stepType: 'DRAFT_EMAIL',
      });

      expect(sanitizedHtmlBody).toContain(
        'Draft line one<br><br>Draft line two',
      );
      expect(plainTextBody).toBe('Draft line one\n\nDraft line two');
    }, 300000);
  });

  describe('workflow email body held by a whole-body variable', () => {
    const wholeBodyVariable = (variable: string): EmailDocument => ({
      type: 'doc',
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
      content: [{ type: 'htmlDocument', attrs: { html: variable } }],
    });

    it('sends the HTML it holds verbatim', async () => {
      const { sanitizedHtmlBody } = await runSendEmailWorkflow({
        body: wholeBodyVariable('{{trigger.html}}'),
        payload: { html: '<h1>Weekly report</h1><p>All good</p>' },
      });

      expect(sanitizedHtmlBody).toBe('<h1>Weekly report</h1><p>All good</p>');
    }, 300000);

    it('renders the email document it holds', async () => {
      const { sanitizedHtmlBody, plainTextBody } = await runSendEmailWorkflow({
        body: wholeBodyVariable('{{trigger.document}}'),
        payload: {
          document: JSON.stringify(paragraphDocument('From a record')),
        },
      });

      expect(sanitizedHtmlBody).toContain(EMAIL_SHELL_MARKER);
      expect(plainTextBody).toBe('From a record');
    }, 300000);
  });

  describe('workflow email body stored as a string', () => {
    it('fails the step instead of guessing the format', async () => {
      const run = await runEmailBodyWorkflow({
        body: '<p>Hello {{trigger.name}}</p>',
        payload: { name: 'Ada' },
      });

      expect(run).toMatchObject({
        stepStatus: 'FAILED',
        stepError: expect.stringContaining('Invalid email document'),
      });
    }, 300000);
  });

  describe('send_email tool', () => {
    it('keeps the paragraphs of a plain-text body and persists them', async () => {
      const { plainTextBody, subject } = await executeSendEmailTool({
        type: 'text',
        text: 'Dear Nick,\n\nThanks for the call.\nBest,\nJane',
      });

      expect(plainTextBody).toBe(
        'Dear Nick,\n\nThanks for the call.\nBest,\nJane',
      );
      expect(await findPersistedMessageText(subject)).toBe(plainTextBody);
    }, 300000);

    it('sends an HTML body as written', async () => {
      const { sanitizedHtmlBody } = await executeSendEmailTool({
        type: 'html',
        html: '<p>Hello <strong>Ada</strong></p>',
      });

      expect(sanitizedHtmlBody).toBe('<p>Hello <strong>Ada</strong></p>');
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
        error: expect.stringContaining('Invalid email document'),
      });
      expect(await findPersistedMessageText(subject)).toBeUndefined();
    }, 300000);
  });

  describe('sendEmail mutation', () => {
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

    it('accepts a document saved without a schema version', async () => {
      const subject = `Mutation unversioned ${randomUUID()}`;

      const result = await sendEmail({
        connectedAccountId,
        to: HANDLE,
        subject,
        body: JSON.stringify({
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
          ],
        }),
      });

      expect(result.success).toBe(true);
      expect(await findPersistedMessageText(subject)).toBe('Hi');
    }, 300000);

    it('sends a composer email the user never typed into', async () => {
      const result = await sendEmail({
        connectedAccountId,
        to: HANDLE,
        subject: `Mutation empty ${randomUUID()}`,
        body: JSON.stringify({
          type: 'doc',
          attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
          content: [{ type: 'paragraph', content: [] }],
        }),
      });

      expect(result.success).toBe(true);
    }, 300000);

    it('rejects a body that is not a serialized email document', async () => {
      const subject = `Mutation string ${randomUUID()}`;

      const result = await sendEmail({
        connectedAccountId,
        to: HANDLE,
        subject,
        body: '<p>Hello</p>',
      });

      expect(result.success).toBe(false);
      expect(await findPersistedMessageText(subject)).toBeUndefined();
    }, 300000);
  });

  describe('upgrade command', () => {
    const runUpgradeCommand = ({
      dryRun,
      commandClassName = 'ConvertWorkflowEmailBodiesToEmailDocumentsCommand',
    }: {
      dryRun: boolean;
      commandClassName?:
        | 'ConvertWorkflowEmailBodiesToEmailDocumentsCommand'
        | 'BackfillEmptyWorkflowEmailBodiesCommand';
    }) =>
      getAppProviderByClassName<WorkspaceOrmManager>(
        'WorkspaceOrmManager',
      ).executeInWorkspaceContext(
        () =>
          getAppProviderByClassName<
            | ConvertWorkflowEmailBodiesToEmailDocumentsCommand
            | BackfillEmptyWorkflowEmailBodiesCommand
          >(commandClassName).runOnWorkspace({
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            options: { dryRun },
            index: 0,
            total: 1,
            dataSource: global.testDataSource,
          }),
        buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
      );

    const convertStoredBodyBeforeRun =
      (legacyBody: string) => async (coreWorkflowVersionId: string) => {
        expect(await readStoredBodies(coreWorkflowVersionId)).toEqual({
          coreBody: legacyBody,
        });

        await runUpgradeCommand({ dryRun: true });

        expect(await readStoredBodies(coreWorkflowVersionId)).toEqual({
          coreBody: legacyBody,
        });

        await runUpgradeCommand({ dryRun: false });

        const convertedBodies = await readStoredBodies(coreWorkflowVersionId);

        expect(
          parseCanonicalEmailDocument(
            parseJson<unknown>(convertedBodies.coreBody),
          ).success,
        ).toBe(true);

        await runUpgradeCommand({ dryRun: false });

        expect(await readStoredBodies(coreWorkflowVersionId)).toEqual(
          convertedBodies,
        );
      };

    it.each([
      {
        kind: 'plain text with variables',
        body: 'Hi {{trigger.name}},\n\nSee you soon',
        payload: { name: 'Ada' },
        expectedHtml: /Hi Ada,<br\s*\/?><br\s*\/?>See you soon/,
      },
      {
        kind: 'HTML with raw variable values',
        body: '<p>Hello {{trigger.name}}</p>',
        payload: { name: '<b>Ada</b>' },
        expectedHtml: '<p>Hello <b>Ada</b></p>',
      },
      {
        kind: 'a single variable holding HTML',
        body: '{{trigger.html}}',
        payload: { html: '<h1>Report</h1><p>All good</p>' },
        expectedHtml: '<h1>Report</h1><p>All good</p>',
      },
    ])(
      'sends a stored body made of $kind once the upgrade converts it',
      async ({ body, payload, expectedHtml }) => {
        const { sanitizedHtmlBody } = await runSendEmailWorkflow({
          body,
          payload,
          beforeRun: convertStoredBodyBeforeRun(body),
        });

        expect(sanitizedHtmlBody).toMatch(expectedHtml);
      },
      300000,
    );

    it('sends a blank stored body once the backfill stores an empty document', async () => {
      const serializedEmptyDocument = JSON.stringify(EMPTY_EMAIL_DOCUMENT);

      await runSendEmailWorkflow({
        body: ' ',
        beforeRun: async (coreWorkflowVersionId) => {
          await runUpgradeCommand({
            dryRun: true,
            commandClassName: 'BackfillEmptyWorkflowEmailBodiesCommand',
          });

          expect(await readStoredBodies(coreWorkflowVersionId)).toEqual({
            coreBody: ' ',
          });

          await runUpgradeCommand({
            dryRun: false,
            commandClassName: 'BackfillEmptyWorkflowEmailBodiesCommand',
          });

          expect(await readStoredBodies(coreWorkflowVersionId)).toEqual({
            coreBody: serializedEmptyDocument,
          });
        },
      });
    }, 300000);

    it('sends the same email from a versionless document before and after the upgrade', async () => {
      const body = JSON.stringify({
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
        ],
      });

      const beforeUpgrade = await runSendEmailWorkflow({ body });
      const afterUpgrade = await runSendEmailWorkflow({
        body,
        beforeRun: convertStoredBodyBeforeRun(body),
      });

      expect(afterUpgrade.sanitizedHtmlBody).toBe(
        beforeUpgrade.sanitizedHtmlBody,
      );
      expect(afterUpgrade.plainTextBody).toBe(beforeUpgrade.plainTextBody);
    }, 600000);
  });
});
