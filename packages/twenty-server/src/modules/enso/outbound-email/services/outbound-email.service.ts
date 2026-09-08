import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { buildEnsoTimelineInserts } from 'src/modules/enso/timeline/enso-timeline.util';
import { SendEmailService } from 'src/modules/messaging/message-outbound-manager/services/send-email.service';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';

// Manager 1:1 outbound email as a first-class outboundActivity, mirroring the
// SMS send actions — but with INFORM-not-block consent. The recipient is the
// contact's primary email, the sender is the MANAGER's own connected account
// (the channel difference from SMS's project.smsAlias: personal 1:1 reply, not a
// project brand alias). Consent is ADVISORY: consulted and surfaced, never gated.
type EmailContext = {
  personId?: string;
  to?: string;
  from?: string;
  connectedAccountId?: string;
  opportunityId?: string;
  canSend: boolean;
  reason?: string;
  hasEmailConsent: boolean;
  consentNote?: string;
};

@Injectable()
export class OutboundEmailService {
  private readonly logger = new Logger(OutboundEmailService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly emailComposerService: EmailComposerService,
    private readonly sendEmailService: SendEmailService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  // Resolve the manager's own connected account (personal 1:1 sender). Prefer the
  // account owned by the current userWorkspace; fall back to any workspace account
  // so a send is still technically possible even if ownership can't be matched.
  private async resolveSenderConnectedAccount(
    workspaceId: string,
    userWorkspaceId?: string,
  ): Promise<{ id: string; handle: string } | undefined> {
    // Core-connection repo (@InjectRepository) — it needs NO workspace context,
    // and must not open one here since this runs inside the callers'
    // executeInWorkspaceContext blocks (nesting is avoided across enso code).
    if (isNonEmptyString(userWorkspaceId)) {
      const owned = await this.connectedAccountRepository.findOne({
        where: { workspaceId, userWorkspaceId },
      });

      if (isDefined(owned)) {
        return { id: owned.id, handle: owned.handle };
      }
    }

    const anyAccount = await this.connectedAccountRepository.findOne({
      where: { workspaceId },
    });

    return isDefined(anyAccount)
      ? { id: anyAccount.id, handle: anyAccount.handle }
      : undefined;
  }

  // Read the ADVISORY email-marketing consent for the deal's project. Returns a
  // boolean + a human note; NEVER sets canSend:false (inform, don't block).
  private buildConsentAdvice(hasConsent: boolean): {
    hasEmailConsent: boolean;
    consentNote?: string;
  } {
    return hasConsent
      ? { hasEmailConsent: true }
      : {
          hasEmailConsent: false,
          consentNote: 'This lead has not granted email consent.',
        };
  }

  // Resolve everything a 1:1 email-from-task needs + whether it may be sent.
  // canSend reflects TECHNICAL validity only (recipient email present AND a
  // usable connected account present) — never consent. Shared by preflight+send.
  async resolveTaskEmailContext(
    workspaceId: string,
    taskId: string,
    userWorkspaceId?: string,
  ): Promise<EmailContext> {
    let context: EmailContext = {
      canSend: false,
      reason: 'Could not resolve this task.',
      hasEmailConsent: false,
    };

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const taskTargetRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'taskTarget',
          { shouldBypassPermissionChecks: true },
        );
      const opportunityRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'opportunity',
          { shouldBypassPermissionChecks: true },
        );
      const personRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'person',
          { shouldBypassPermissionChecks: true },
        );
      const consentRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'personProjectConsent',
          { shouldBypassPermissionChecks: true },
        );

      const targets = await taskTargetRepository.find({ where: { taskId } });
      const opportunityId = targets.find((target: any) =>
        isDefined(target.targetOpportunityId),
      )?.targetOpportunityId as string | undefined;
      const personId = targets.find((target: any) =>
        isDefined(target.targetPersonId),
      )?.targetPersonId as string | undefined;

      if (!isDefined(personId)) {
        context = {
          canSend: false,
          reason: 'No contact is linked to this task.',
          hasEmailConsent: false,
        };

        return;
      }

      const person = await personRepository.findOne({
        where: { id: personId },
      });
      const to = person?.emails?.primaryEmail as string | undefined;

      // The deal's project drives the (advisory) consent check.
      let projectId: string | undefined;

      if (isDefined(opportunityId)) {
        const opportunity = await opportunityRepository.findOne({
          where: { id: opportunityId },
        });

        projectId = (opportunity?.projectId as string | undefined) ?? undefined;
      }

      const consents = await consentRepository.find({ where: { personId } });
      const consent = isDefined(projectId)
        ? consents.find((row: any) => row.projectId === projectId)
        : consents[0];
      const consentAdvice = this.buildConsentAdvice(
        consent?.emailMarketingConsent === true,
      );

      const sender = await this.resolveSenderConnectedAccount(
        workspaceId,
        userWorkspaceId,
      );

      if (!isNonEmptyString(to)) {
        context = {
          personId,
          opportunityId,
          from: sender?.handle,
          connectedAccountId: sender?.id,
          canSend: false,
          reason: 'No email address on file for this contact.',
          ...consentAdvice,
        };

        return;
      }

      if (!isDefined(sender)) {
        context = {
          personId,
          to,
          opportunityId,
          canSend: false,
          reason: 'No connected email account is available to send from.',
          ...consentAdvice,
        };

        return;
      }

      // canSend = technical validity only (recipient email + connected account).
      context = {
        personId,
        to,
        opportunityId,
        from: sender.handle,
        connectedAccountId: sender.id,
        canSend: true,
        ...consentAdvice,
      };
    }, buildSystemAuthContext(workspaceId));

    return context;
  }

  // Deal-keyed variant for object/standalone logging (no task): given a chosen
  // deal + contact, resolve recipient email + sender + advisory consent.
  async resolveEmailContextForDeal(params: {
    workspaceId: string;
    opportunityId?: string;
    personId?: string;
    userWorkspaceId?: string;
  }): Promise<EmailContext> {
    const { workspaceId, opportunityId, personId, userWorkspaceId } = params;

    if (!isNonEmptyString(personId)) {
      return {
        canSend: false,
        reason: 'No contact selected.',
        hasEmailConsent: false,
      };
    }

    let context: EmailContext = {
      canSend: false,
      reason: 'Could not resolve this deal.',
      hasEmailConsent: false,
    };

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const opportunityRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'opportunity',
          { shouldBypassPermissionChecks: true },
        );
      const personRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'person',
          { shouldBypassPermissionChecks: true },
        );
      const consentRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'personProjectConsent',
          { shouldBypassPermissionChecks: true },
        );

      const person = await personRepository.findOne({
        where: { id: personId },
      });
      const to = person?.emails?.primaryEmail as string | undefined;

      let projectId: string | undefined;

      if (isNonEmptyString(opportunityId)) {
        const opportunity = await opportunityRepository.findOne({
          where: { id: opportunityId },
        });

        projectId = (opportunity?.projectId as string | undefined) ?? undefined;
      }

      const consents = await consentRepository.find({ where: { personId } });
      const consent = isDefined(projectId)
        ? consents.find((row: any) => row.projectId === projectId)
        : undefined;
      const consentAdvice = this.buildConsentAdvice(
        consent?.emailMarketingConsent === true,
      );

      const sender = await this.resolveSenderConnectedAccount(
        workspaceId,
        userWorkspaceId,
      );

      if (!isNonEmptyString(to)) {
        context = {
          personId,
          opportunityId: opportunityId ?? undefined,
          from: sender?.handle,
          connectedAccountId: sender?.id,
          canSend: false,
          reason: 'No email address on file for this contact.',
          ...consentAdvice,
        };

        return;
      }

      if (!isDefined(sender)) {
        context = {
          personId,
          to,
          opportunityId: opportunityId ?? undefined,
          canSend: false,
          reason: 'No connected email account is available to send from.',
          ...consentAdvice,
        };

        return;
      }

      context = {
        personId,
        to,
        opportunityId: opportunityId ?? undefined,
        from: sender.handle,
        connectedAccountId: sender.id,
        canSend: true,
        ...consentAdvice,
      };
    }, buildSystemAuthContext(workspaceId));

    return context;
  }

  // What the compose modal needs: resolved sender + technical sendability +
  // advisory consent state (so the widget can warn without disabling send).
  async getTaskEmailContext(params: {
    workspaceId: string;
    taskId: string;
    userWorkspaceId?: string;
  }): Promise<{
    from: string | null;
    canSend: boolean;
    reason: string | null;
    hasEmailConsent: boolean;
    consentNote: string | null;
  }> {
    const context = await this.resolveTaskEmailContext(
      params.workspaceId,
      params.taskId,
      params.userWorkspaceId,
    );

    return {
      from: context.from ?? null,
      canSend: context.canSend,
      reason: context.reason ?? null,
      hasEmailConsent: context.hasEmailConsent,
      consentNote: context.consentNote ?? null,
    };
  }

  // Object/standalone email preflight for a chosen deal + contact.
  async getRecordEmailContext(params: {
    workspaceId: string;
    opportunityId?: string;
    personId?: string;
    userWorkspaceId?: string;
  }): Promise<{
    from: string | null;
    canSend: boolean;
    reason: string | null;
    hasEmailConsent: boolean;
    consentNote: string | null;
  }> {
    const context = await this.resolveEmailContextForDeal(params);

    return {
      from: context.from ?? null,
      canSend: context.canSend,
      reason: context.reason ?? null,
      hasEmailConsent: context.hasEmailConsent,
      consentNote: context.consentNote ?? null,
    };
  }

  // Compose + send via the messaging outbound path (reused SMTP/Gmail sender),
  // then log the outboundActivity. Shared by the task + record send entrypoints.
  // Sends REGARDLESS of consent when canSend (technical) is true.
  private async composeSendAndLog(params: {
    workspaceId: string;
    context: EmailContext;
    subject: string;
    body: string;
    taskId?: string;
    workspaceMemberId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { workspaceId, context, subject, body, taskId, workspaceMemberId } =
      params;
    const { to, from, connectedAccountId, opportunityId, personId } = context;

    if (
      !context.canSend ||
      !isNonEmptyString(to) ||
      !isNonEmptyString(connectedAccountId)
    ) {
      return {
        success: false,
        error: context.reason ?? 'Could not send email.',
      };
    }

    // Reuse the email-tool composer to build+sanitize the ComposedEmail and
    // resolve the connected-account entity, then hand it to the outbound sender —
    // exactly the send-email.resolver path, minus attachments.
    const composed = await this.emailComposerService.composeEmail(
      {
        recipients: { to, cc: '', bcc: '' },
        subject,
        body,
        connectedAccountId,
        files: [],
      },
      { workspaceId },
      { attachmentsFileFolder: FileFolder.EmailAttachment },
    );

    if (!composed.success) {
      return {
        success: false,
        error: composed.output.error ?? composed.output.message,
      };
    }

    let sendResult: SendMessageResult;

    try {
      sendResult = await this.sendEmailService.sendComposedEmail(composed.data);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error}`);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email.',
      };
    }

    // Persist the sent email as a native message too (so it shows in the record's
    // Emails tab/thread), mirroring the native send-email resolver. Best-effort:
    // the email already left, so a persist hiccup must not fail the action or the
    // outboundActivity log below.
    if (composed.data.shouldPersistMessage) {
      try {
        await this.sendEmailService.persistSentMessage(
          sendResult,
          composed.data,
          workspaceId,
        );
      } catch (error) {
        this.logger.warn(`Sent email persisted-message write failed: ${error}`);
      }
    }

    // Prefer the provider message id; fall back to the RFC header id. Used both
    // as the timeline row's externalId and (later) for Sent-folder idempotency.
    const externalId =
      sendResult.messageExternalId ?? sendResult.headerMessageId;
    const externalThreadId = sendResult.threadExternalId;

    let result: { success: boolean; error?: string } = {
      success: false,
      error: 'Could not log the email.',
    };

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const outboundActivityRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'outboundActivity',
          { shouldBypassPermissionChecks: true },
        );

      // NOTE: subject / toIdentity / externalThreadId are NOT yet on the
      // outboundActivity metadata object — they are set here so the code is ready
      // once those fields are added (gated Step-B metadata delta). Extra keys on
      // an ORM save are ignored until the columns exist.
      await outboundActivityRepository.save({
        channel: 'EMAIL',
        loggedVia: 'CRM_INITIATED',
        subject,
        body,
        fromIdentity: from,
        toIdentity: to,
        occurredAt: new Date(),
        ...(isNonEmptyString(externalId) ? { externalId } : {}),
        ...(isNonEmptyString(externalThreadId) ? { externalThreadId } : {}),
        ...(isNonEmptyString(taskId) ? { taskId } : {}),
        ...(isNonEmptyString(opportunityId) ? { opportunityId } : {}),
        // The sending manager — so the touch is attributed to them, not "System".
        ...(isNonEmptyString(workspaceMemberId)
          ? { performedById: workspaceMemberId }
          : {}),
        personId,
      });

      result = { success: true };
    }, buildSystemAuthContext(workspaceId));

    // One clean, unified timeline line for the touch ("Sent an email … — by
    // <Manager>"), and — since we ALSO persist a native Message above — the
    // matching native "linked an email" row is hidden client-side by keying this
    // event to the same message id. Best-effort: never fail the send.
    await this.writeOutboundEmailTimeline({
      workspaceId,
      personId,
      opportunityId,
      subject,
      headerMessageId: sendResult.headerMessageId,
      workspaceMemberId,
    });

    return result;
  }

  // Emits the enso green-sentence timeline event for a sent 1:1 email. Opens its
  // OWN workspace context (called after the log block closes — never nested), and
  // resolves the native message id (by externalId) so the frontend can dedupe the
  // native "linked an email" row against this event.
  private async writeOutboundEmailTimeline(params: {
    workspaceId: string;
    personId?: string;
    opportunityId?: string;
    subject: string;
    headerMessageId?: string | null;
    workspaceMemberId?: string;
  }): Promise<void> {
    const {
      workspaceId,
      personId,
      opportunityId,
      subject,
      headerMessageId,
      workspaceMemberId,
    } = params;

    if (!isNonEmptyString(personId) && !isNonEmptyString(opportunityId)) {
      return;
    }

    try {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          // Correlate to the native Message (persisted above) so the frontend can
          // hide its duplicate "linked an email" row — matched on the RFC
          // header-message-id. Best-effort in its OWN try: a correlation miss must
          // never prevent the timeline line itself from being written.
          let messageId: string | undefined;

          if (isNonEmptyString(headerMessageId)) {
            try {
              const messageRepository =
                await this.globalWorkspaceOrmManager.getRepository<any>(
                  workspaceId,
                  'message',
                  { shouldBypassPermissionChecks: true },
                );
              const message = await messageRepository.findOne({
                where: { headerMessageId },
              });

              if (isDefined(message?.id)) {
                messageId = message.id;
              }
            } catch (error) {
              this.logger.warn(
                `outbound email message correlation failed: ${
                  (error as Error).message
                }`,
              );
            }
          }

          const timelineRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'timelineActivity',
              { shouldBypassPermissionChecks: true },
            );

          const rows = buildEnsoTimelineInserts({
            action: 'email-sent',
            target: {
              ...(isNonEmptyString(personId) ? { personId } : {}),
              ...(isNonEmptyString(opportunityId) ? { opportunityId } : {}),
            },
            segments: isNonEmptyString(subject)
              ? [{ text: 'Sent an email · ' }, { text: subject }]
              : [{ text: 'Sent an email' }],
            ...(isNonEmptyString(workspaceMemberId)
              ? { workspaceMemberId }
              : { auto: true }),
            ...(isDefined(messageId) ? { linkedRecordId: messageId } : {}),
            happensAt: new Date().toISOString(),
          });

          if (rows.length > 0) {
            await timelineRepository.insert(rows);
          }
        },
        buildSystemAuthContext(workspaceId),
      );
    } catch (error) {
      this.logger.warn(
        `outbound email timeline write failed: ${(error as Error).message}`,
      );
    }
  }

  // Manager-initiated 1:1 email from a task. Technical validity + sender are
  // resolved server-side; sends REGARDLESS of consent (inform, don't block) and
  // logs an outboundActivity (= the timeline entry).
  async sendTaskEmail(params: {
    workspaceId: string;
    taskId: string;
    subject: string;
    body: string;
    userWorkspaceId?: string;
    workspaceMemberId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const context = await this.resolveTaskEmailContext(
      params.workspaceId,
      params.taskId,
      params.userWorkspaceId,
    );

    return this.composeSendAndLog({
      workspaceId: params.workspaceId,
      context,
      subject: params.subject,
      body: params.body,
      taskId: params.taskId,
      workspaceMemberId: params.workspaceMemberId,
    });
  }

  // Manager-initiated 1:1 email from a record (no task): same rules, logs an
  // outboundActivity linked to the deal + contact (no taskId).
  async sendRecordEmail(params: {
    workspaceId: string;
    opportunityId?: string;
    personId?: string;
    subject: string;
    body: string;
    userWorkspaceId?: string;
    workspaceMemberId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const context = await this.resolveEmailContextForDeal({
      workspaceId: params.workspaceId,
      opportunityId: params.opportunityId,
      personId: params.personId,
      userWorkspaceId: params.userWorkspaceId,
    });

    return this.composeSendAndLog({
      workspaceId: params.workspaceId,
      context,
      subject: params.subject,
      body: params.body,
      workspaceMemberId: params.workspaceMemberId,
    });
  }
}
