import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type SendSmsInput } from 'src/modules/enso/marketing-sync/dtos/send-sms.input';
import {
  isFinalSmsDeliveryStatus,
  SmsMdClientService,
} from 'src/modules/enso/marketing-sync/services/sms-md-client.service';
import { toE164 } from 'src/modules/enso/shared/utils/person-phone.util';
import { buildEnsoTimelineInserts } from 'src/modules/enso/timeline/enso-timeline.util';

// Relays a Dittofeed SMS journey step to sms.md and records a timeline event on
// the person, so the sales manager sees the SMS alongside the rest of the
// marketing journey (the whole point of the in-CRM visibility layer).
@Injectable()
export class MarketingSmsService {
  private readonly logger = new Logger(MarketingSmsService.name);

  constructor(
    private readonly smsMdClientService: SmsMdClientService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async send(input: SendSmsInput): Promise<void> {
    await this.smsMdClientService.send(input.workspaceId, {
      to: input.to,
      message: input.message,
    });

    if (isDefined(input.userId)) {
      await this.writeTimeline(input.workspaceId, input.userId);
    }
  }

  // Resolve everything an SMS-from-task needs and whether it may be sent. The
  // sender alias is AUTHORITATIVE from the deal's project (project.smsAlias) —
  // never trusted from the client — so a manager can't send under a brand the
  // lead didn't consent to. Shared by the send and the modal preflight.
  async resolveTaskSmsContext(
    workspaceId: string,
    taskId: string,
  ): Promise<{
    personId?: string;
    to?: string;
    opportunityId?: string;
    alias?: string;
    canSend: boolean;
    reason?: string;
  }> {
    let context: {
      personId?: string;
      to?: string;
      opportunityId?: string;
      alias?: string;
      canSend: boolean;
      reason?: string;
    } = { canSend: false, reason: 'Could not resolve this task.' };

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
      const projectRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'project',
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
        };

        return;
      }

      const person = await personRepository.findOne({
        where: { id: personId },
      });
      const to = toE164(
        person?.phones?.primaryPhoneCallingCode,
        person?.phones?.primaryPhoneNumber,
      );

      if (!isDefined(to)) {
        context = {
          personId,
          opportunityId,
          canSend: false,
          reason: 'No phone number on file for this contact.',
        };

        return;
      }

      // The deal's project drives BOTH the consent check and the sender alias.
      let projectId: string | undefined;

      if (isDefined(opportunityId)) {
        const opportunity = await opportunityRepository.findOne({
          where: { id: opportunityId },
        });

        projectId = (opportunity?.projectId as string | undefined) ?? undefined;
      }

      const alias = isDefined(projectId)
        ? (((await projectRepository.findOne({ where: { id: projectId } }))
            ?.smsAlias as string | undefined) ?? undefined)
        : undefined;

      if (!isNonEmptyString(alias)) {
        context = {
          personId,
          to,
          opportunityId,
          canSend: false,
          reason: "No SMS sender is configured for this deal's project.",
        };

        return;
      }

      const consents = await consentRepository.find({ where: { personId } });
      const consent = isDefined(projectId)
        ? consents.find((row: any) => row.projectId === projectId)
        : consents[0];

      if (consent?.smsMarketingConsent !== true) {
        context = {
          personId,
          to,
          opportunityId,
          alias,
          canSend: false,
          reason: 'This lead has not granted SMS consent.',
        };

        return;
      }

      context = { personId, to, opportunityId, alias, canSend: true };
    }, buildSystemAuthContext(workspaceId));

    return context;
  }

  // What the compose modal needs: the determined alias + whether send is allowed.
  async getTaskSmsContext(params: {
    workspaceId: string;
    taskId: string;
  }): Promise<{
    alias: string | null;
    canSend: boolean;
    reason: string | null;
  }> {
    const context = await this.resolveTaskSmsContext(
      params.workspaceId,
      params.taskId,
    );

    return {
      alias: context.alias ?? null,
      canSend: context.canSend,
      reason: context.reason ?? null,
    };
  }

  // Manager-initiated 1:1 SMS from a task. Consent + sender alias are resolved
  // server-side (authoritative). On success: sends via the project's alias,
  // logs an outboundActivity, and stamps it QUEUED for delivery-receipt polling.
  async sendTaskSms(params: {
    workspaceId: string;
    taskId: string;
    message: string;
    workspaceMemberId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { workspaceId, taskId, message, workspaceMemberId } = params;
    const context = await this.resolveTaskSmsContext(workspaceId, taskId);

    if (
      !context.canSend ||
      !isNonEmptyString(context.to) ||
      !isNonEmptyString(context.alias)
    ) {
      return { success: false, error: context.reason ?? 'Could not send SMS.' };
    }

    const { to, alias, opportunityId, personId } = context;

    await this.smsMdClientService.send(workspaceId, {
      to,
      message,
      from: alias,
    });

    // sms.md /send returns no id → correlate the just-queued message so we can
    // poll its delivery status later. Best-effort; null externalId just means
    // the activity stays QUEUED (no DLR) rather than failing the send.
    const externalId = await this.smsMdClientService.findRecentMessageId(
      workspaceId,
      { to, message },
    );

    let result: { success: boolean; error?: string } = {
      success: false,
      error: 'Could not log the SMS.',
    };

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const outboundActivityRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'outboundActivity',
          { shouldBypassPermissionChecks: true },
        );

      await outboundActivityRepository.save({
        channel: 'SMS',
        loggedVia: 'CRM_INITIATED',
        body: message,
        fromIdentity: alias,
        deliveryStatus: 'QUEUED',
        occurredAt: new Date(),
        taskId,
        ...(isDefined(externalId) ? { externalId } : {}),
        ...(isDefined(opportunityId) ? { opportunityId } : {}),
        ...(isNonEmptyString(workspaceMemberId)
          ? { performedById: workspaceMemberId }
          : {}),
        personId,
      });

      result = { success: true };
    }, buildSystemAuthContext(workspaceId));

    await this.writeOutboundSmsTimeline({
      workspaceId,
      personId,
      opportunityId,
      workspaceMemberId,
    });

    return result;
  }

  // Deal-keyed variant of resolveTaskSmsContext for object/standalone logging
  // (no task): given a chosen deal + contact, resolve phone + the project's
  // alias + consent. Same authoritative rules — alias from the deal's project.
  async resolveSmsContextForDeal(params: {
    workspaceId: string;
    opportunityId?: string;
    personId?: string;
  }): Promise<{
    to?: string;
    alias?: string;
    canSend: boolean;
    reason?: string;
  }> {
    const { workspaceId, opportunityId, personId } = params;

    if (!isNonEmptyString(personId)) {
      return { canSend: false, reason: 'No contact selected.' };
    }
    if (!isNonEmptyString(opportunityId)) {
      return { canSend: false, reason: 'Pick a deal to send under its brand.' };
    }

    let context: {
      to?: string;
      alias?: string;
      canSend: boolean;
      reason?: string;
    } = { canSend: false, reason: 'Could not resolve this deal.' };

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const opportunityRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'opportunity',
          { shouldBypassPermissionChecks: true },
        );
      const projectRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'project',
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
      const to = toE164(
        person?.phones?.primaryPhoneCallingCode,
        person?.phones?.primaryPhoneNumber,
      );

      if (!isDefined(to)) {
        context = {
          canSend: false,
          reason: 'No phone number on file for this contact.',
        };

        return;
      }

      const opportunity = await opportunityRepository.findOne({
        where: { id: opportunityId },
      });
      const projectId =
        (opportunity?.projectId as string | undefined) ?? undefined;
      const alias = isDefined(projectId)
        ? (((await projectRepository.findOne({ where: { id: projectId } }))
            ?.smsAlias as string | undefined) ?? undefined)
        : undefined;

      if (!isNonEmptyString(alias)) {
        context = {
          to,
          canSend: false,
          reason: "No SMS sender is configured for this deal's project.",
        };

        return;
      }

      const consents = await consentRepository.find({ where: { personId } });
      const consent = isDefined(projectId)
        ? consents.find((row: any) => row.projectId === projectId)
        : undefined;

      if (consent?.smsMarketingConsent !== true) {
        context = {
          to,
          alias,
          canSend: false,
          reason: 'This lead has not granted SMS consent.',
        };

        return;
      }

      context = { to, alias, canSend: true };
    }, buildSystemAuthContext(workspaceId));

    return context;
  }

  // Modal preflight for object/standalone SMS: alias + sendability for a deal.
  async getRecordSmsContext(params: {
    workspaceId: string;
    opportunityId?: string;
    personId?: string;
  }): Promise<{
    alias: string | null;
    canSend: boolean;
    reason: string | null;
  }> {
    const context = await this.resolveSmsContextForDeal(params);

    return {
      alias: context.alias ?? null,
      canSend: context.canSend,
      reason: context.reason ?? null,
    };
  }

  // Manager-initiated SMS from a record (no task): same consent + alias rules,
  // logs an outboundActivity linked to the deal + contact (no taskId).
  async sendRecordSms(params: {
    workspaceId: string;
    opportunityId?: string;
    personId?: string;
    message: string;
    workspaceMemberId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { workspaceId, opportunityId, personId, message, workspaceMemberId } =
      params;
    const context = await this.resolveSmsContextForDeal({
      workspaceId,
      opportunityId,
      personId,
    });

    if (
      !context.canSend ||
      !isNonEmptyString(context.to) ||
      !isNonEmptyString(context.alias)
    ) {
      return { success: false, error: context.reason ?? 'Could not send SMS.' };
    }

    const { to, alias } = context;

    await this.smsMdClientService.send(workspaceId, {
      to,
      message,
      from: alias,
    });

    const externalId = await this.smsMdClientService.findRecentMessageId(
      workspaceId,
      { to, message },
    );

    let result: { success: boolean; error?: string } = {
      success: false,
      error: 'Could not log the SMS.',
    };

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const outboundActivityRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'outboundActivity',
          { shouldBypassPermissionChecks: true },
        );

      await outboundActivityRepository.save({
        channel: 'SMS',
        loggedVia: 'CRM_INITIATED',
        body: message,
        fromIdentity: alias,
        deliveryStatus: 'QUEUED',
        occurredAt: new Date(),
        ...(isDefined(externalId) ? { externalId } : {}),
        ...(isNonEmptyString(opportunityId) ? { opportunityId } : {}),
        ...(isNonEmptyString(workspaceMemberId)
          ? { performedById: workspaceMemberId }
          : {}),
        personId,
      });

      result = { success: true };
    }, buildSystemAuthContext(workspaceId));

    await this.writeOutboundSmsTimeline({
      workspaceId,
      personId,
      opportunityId,
      workspaceMemberId,
    });

    return result;
  }

  // Person-keyed SMS for object/launcher logging: a touch targets a PERSON, so
  // the allowed senders are the brands of the projects THAT PERSON consented to
  // (distinct project.smsAlias across their granted personProjectConsent rows).
  // The deal is optional context. Returns phone + the consented-brand alias set.
  private async resolvePersonSms(
    workspaceId: string,
    personId?: string,
  ): Promise<{
    to?: string;
    aliases: string[];
    canSend: boolean;
    reason?: string;
  }> {
    if (!isNonEmptyString(personId)) {
      return { aliases: [], canSend: false, reason: 'No contact selected.' };
    }

    let result: {
      to?: string;
      aliases: string[];
      canSend: boolean;
      reason?: string;
    } = {
      aliases: [],
      canSend: false,
      reason: 'Could not resolve this contact.',
    };

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
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
      const projectRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'project',
          { shouldBypassPermissionChecks: true },
        );

      const person = await personRepository.findOne({
        where: { id: personId },
      });
      const to = toE164(
        person?.phones?.primaryPhoneCallingCode,
        person?.phones?.primaryPhoneNumber,
      );

      if (!isDefined(to)) {
        result = {
          aliases: [],
          canSend: false,
          reason: 'No phone number on file for this contact.',
        };

        return;
      }

      const consents = await consentRepository.find({ where: { personId } });
      const consentedProjectIds = consents
        .filter((row: any) => row.smsMarketingConsent === true)
        .map((row: any) => row.projectId as string | undefined)
        .filter((projectId: string | undefined) => isNonEmptyString(projectId));

      if (consentedProjectIds.length === 0) {
        result = {
          to,
          aliases: [],
          canSend: false,
          reason: 'This contact has not granted SMS consent.',
        };

        return;
      }

      const aliasSet = new Set<string>();

      for (const projectId of consentedProjectIds) {
        const project = await projectRepository.findOne({
          where: { id: projectId },
        });
        const alias = project?.smsAlias as string | undefined;

        if (isNonEmptyString(alias)) {
          aliasSet.add(alias);
        }
      }

      if (aliasSet.size === 0) {
        result = {
          to,
          aliases: [],
          canSend: false,
          reason:
            "No SMS sender is configured for this contact's consented projects.",
        };

        return;
      }

      result = { to, aliases: [...aliasSet], canSend: true };
    }, buildSystemAuthContext(workspaceId));

    return result;
  }

  // Modal preflight: the sender aliases the contact may be reached under.
  async getPersonSmsContext(params: {
    workspaceId: string;
    personId?: string;
  }): Promise<{ aliases: string[]; canSend: boolean; reason: string | null }> {
    const context = await this.resolvePersonSms(
      params.workspaceId,
      params.personId,
    );

    return {
      aliases: context.aliases,
      canSend: context.canSend,
      reason: context.reason ?? null,
    };
  }

  // Object/launcher SMS: validate the chosen alias is one the contact consented
  // to (authoritative), send, and log against the contact (+ optional deal).
  async sendPersonSms(params: {
    workspaceId: string;
    personId?: string;
    message: string;
    alias?: string;
    opportunityId?: string;
    taskId?: string;
    workspaceMemberId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const {
      workspaceId,
      personId,
      message,
      alias,
      opportunityId,
      taskId,
      workspaceMemberId,
    } = params;
    const context = await this.resolvePersonSms(workspaceId, personId);

    if (!context.canSend || !isNonEmptyString(context.to)) {
      return { success: false, error: context.reason ?? 'Could not send SMS.' };
    }
    if (!isNonEmptyString(alias) || !context.aliases.includes(alias)) {
      return {
        success: false,
        error: 'Pick a sender the contact has consented to.',
      };
    }

    const { to } = context;

    await this.smsMdClientService.send(workspaceId, {
      to,
      message,
      from: alias,
    });

    const externalId = await this.smsMdClientService.findRecentMessageId(
      workspaceId,
      { to, message },
    );

    let result: { success: boolean; error?: string } = {
      success: false,
      error: 'Could not log the SMS.',
    };

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const outboundActivityRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'outboundActivity',
          { shouldBypassPermissionChecks: true },
        );

      await outboundActivityRepository.save({
        channel: 'SMS',
        loggedVia: 'CRM_INITIATED',
        body: message,
        fromIdentity: alias,
        deliveryStatus: 'QUEUED',
        occurredAt: new Date(),
        ...(isDefined(externalId) ? { externalId } : {}),
        ...(isNonEmptyString(opportunityId) ? { opportunityId } : {}),
        ...(isNonEmptyString(taskId) ? { taskId } : {}),
        ...(isNonEmptyString(workspaceMemberId)
          ? { performedById: workspaceMemberId }
          : {}),
        personId,
      });

      result = { success: true };
    }, buildSystemAuthContext(workspaceId));

    await this.writeOutboundSmsTimeline({
      workspaceId,
      personId,
      opportunityId,
      workspaceMemberId,
    });

    return result;
  }

  // Delivery-receipt poll (sms.md is poll-only, no push DLR). For recent SMS
  // activities still in a non-final state that carry an sms.md message id,
  // refresh deliveryStatus. Silent: updates the field, no timeline event.
  async pollDeliveryStatuses(workspaceId: string): Promise<void> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const outboundActivityRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'outboundActivity',
          { shouldBypassPermissionChecks: true },
        );

      const rows = await outboundActivityRepository.find({
        where: { channel: 'SMS' },
        order: { createdAt: 'DESC' },
        take: 200,
      });

      const pending = rows.filter(
        (row: any) =>
          isNonEmptyString(row.externalId) &&
          new Date(row.createdAt) > cutoff &&
          !isFinalSmsDeliveryStatus(row.deliveryStatus),
      );

      for (const row of pending) {
        const status = await this.smsMdClientService.getDeliveryStatus(
          workspaceId,
          row.externalId,
        );

        if (isDefined(status) && status !== row.deliveryStatus) {
          await outboundActivityRepository.update(row.id, {
            deliveryStatus: status,
          });
        }
      }
    }, buildSystemAuthContext(workspaceId));
  }

  // Best-effort: a timeline failure must not fail the SMS send.
  private async writeTimeline(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    try {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const timelineRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'timelineActivity',
              { shouldBypassPermissionChecks: true },
            );

          const rows = buildEnsoTimelineInserts({
            action: 'marketing-sms-sent',
            target: { personId: userId },
            segments: [{ text: 'Sent a marketing SMS' }],
            auto: true,
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
        `marketing SMS timeline write failed for person ${userId}: ${
          (error as Error).message
        }`,
      );
    }
  }

  // One clean, unified timeline line for a manager-sent 1:1 SMS ("Sent an SMS —
  // by <Manager>"), attributed to the sender (or ENSO CRM if unknown). Targets the
  // contact + deal. Best-effort: a timeline failure must not fail the SMS send.
  private async writeOutboundSmsTimeline(params: {
    workspaceId: string;
    personId?: string;
    opportunityId?: string;
    workspaceMemberId?: string;
  }): Promise<void> {
    const { workspaceId, personId, opportunityId, workspaceMemberId } = params;

    if (!isNonEmptyString(personId) && !isNonEmptyString(opportunityId)) {
      return;
    }

    try {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const timelineRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'timelineActivity',
              { shouldBypassPermissionChecks: true },
            );

          const rows = buildEnsoTimelineInserts({
            action: 'sms-sent',
            target: {
              ...(isNonEmptyString(personId) ? { personId } : {}),
              ...(isNonEmptyString(opportunityId) ? { opportunityId } : {}),
            },
            segments: [{ text: 'Sent an SMS' }],
            ...(isNonEmptyString(workspaceMemberId)
              ? { workspaceMemberId }
              : { auto: true }),
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
        `outbound SMS timeline write failed: ${(error as Error).message}`,
      );
    }
  }
}
