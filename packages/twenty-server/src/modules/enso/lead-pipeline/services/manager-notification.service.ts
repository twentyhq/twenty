import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  NOTIFICATION_EVENTS,
  type NotificationEventKey,
} from 'src/modules/enso/notifications/notifications.constants';
import { GoogleChatWebhookService } from 'src/modules/enso/notifications/services/google-chat-webhook.service';
import { readPersonPhoneE164 } from 'src/modules/enso/shared/utils/person-phone.util';

type DealStateTransition = 'stalled' | 'deferred' | 'active' | 'stage';

// Manager notification via Google Chat.
//
// Per-manager events go to the assigned manager's PERSONAL webhook (their
// private space), gated by their per-event toggle (default ON). If a manager
// hasn't configured a webhook we fall back to the shared routing webhook so
// nothing is silently dropped. All posts are best-effort — a missing/failed
// webhook must never fail routing or a query hook.
//   ENSO_ROUTING_CHAT_WEBHOOK_URL — fallback for per-manager events
//   ENSO_OPS_CHAT_WEBHOOK_URL      — escalation / no-candidate alerts (ops space)
@Injectable()
export class ManagerNotificationService {
  private readonly logger = new Logger(ManagerNotificationService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly googleChatWebhookService: GoogleChatWebhookService,
  ) {}

  private get routingWebhookUrl(): string | undefined {
    return process.env.ENSO_ROUTING_CHAT_WEBHOOK_URL || undefined;
  }

  private get opsWebhookUrl(): string | undefined {
    return (
      process.env.ENSO_OPS_CHAT_WEBHOOK_URL ||
      process.env.ENSO_ROUTING_CHAT_WEBHOOK_URL ||
      undefined
    );
  }

  private recordUrl(
    objectNameSingular: string,
    recordId: string,
  ): string | undefined {
    const base = (
      process.env.ENSO_CRM_APP_URL ||
      process.env.FRONTEND_URL ||
      ''
    ).replace(/\/$/, '');

    return base
      ? `${base}/object/${objectNameSingular}/${recordId}`
      : undefined;
  }

  // The assigned manager's personal space, falling back to the shared routing
  // webhook for managers who haven't set one up yet.
  private async resolveManagerWebhookUrl(
    workspaceId: string,
    managerUserId: string | undefined,
  ): Promise<string | undefined> {
    if (isDefined(managerUserId)) {
      const personalWebhookUrl =
        await this.googleChatWebhookService.getWebhookUrl({
          userId: managerUserId,
          workspaceId,
        });

      if (isDefined(personalWebhookUrl)) {
        return personalWebhookUrl;
      }
    }

    return this.routingWebhookUrl;
  }

  private async isMuted(
    workspaceId: string,
    managerUserId: string | undefined,
    event: NotificationEventKey,
  ): Promise<boolean> {
    const enabled = await this.googleChatWebhookService.shouldNotify({
      userId: managerUserId,
      workspaceId,
      event,
    });

    return !enabled;
  }

  // Post the "claim within N minutes" notice for a freshly-assigned deal.
  async notifyAssignment(
    authContext: WorkspaceAuthContext,
    params: {
      opportunityId: string;
      managerId: string;
      autoClaimed: boolean;
      claimWindowMinutes: number;
    },
  ): Promise<void> {
    const workspaceId = authContext.workspace?.id;

    if (!isDefined(workspaceId)) {
      return;
    }

    const details = await this.loadDealDetails(
      workspaceId,
      params.opportunityId,
      params.managerId,
    );

    if (
      await this.isMuted(
        workspaceId,
        details.managerUserId,
        NOTIFICATION_EVENTS.LEAD_ASSIGNED,
      )
    ) {
      return;
    }

    const webhookUrl = await this.resolveManagerWebhookUrl(
      workspaceId,
      details.managerUserId,
    );

    if (!isDefined(webhookUrl)) {
      this.logger.warn('No webhook configured — skipping assignment notice.');

      return;
    }

    const rows = [
      details.dealName
        ? { icon: 'DESCRIPTION', label: 'Deal', text: details.dealName }
        : undefined,
      details.projectName
        ? { icon: 'STORE', label: 'Project', text: details.projectName }
        : undefined,
      details.who
        ? { icon: 'PERSON', label: 'Contact', text: details.who }
        : undefined,
      details.phone
        ? { icon: 'PHONE', label: 'Phone', text: details.phone }
        : undefined,
      isDefined(details.m2)
        ? { icon: 'MAP_PIN', label: 'Area', text: `${details.m2} m²` }
        : undefined,
      details.source
        ? { icon: 'STAR', label: 'Source', text: details.source }
        : undefined,
      params.autoClaimed
        ? undefined
        : {
            icon: 'CLOCK',
            label: 'Claim window',
            text: `${params.claimWindowMinutes} min — unclaimed deals reroute to the next manager`,
          },
    ].filter(isDefined);

    await this.googleChatWebhookService.post(
      webhookUrl,
      this.buildDealCard({
        title: params.autoClaimed
          ? '🔔 New deal assigned to you — your returning client'
          : `🎯 New deal routed — claim within ${params.claimWindowMinutes} min`,
        subtitle: 'ENSO CRM · Routing',
        rows,
        recordUrl: this.recordUrl('opportunity', params.opportunityId),
        buttonText: params.autoClaimed ? 'Open in CRM' : 'Open to claim',
      }),
    );
  }

  // Ops alert when an opportunity can't be routed (no candidates / max attempts).
  async notifyEscalation(
    authContext: WorkspaceAuthContext,
    params: { opportunityId: string; reason: string; attempts?: number },
  ): Promise<void> {
    const webhookUrl = this.opsWebhookUrl;
    const workspaceId = authContext.workspace?.id;

    if (!isDefined(webhookUrl) || !isDefined(workspaceId)) {
      this.logger.warn(`Escalation (no webhook): ${params.reason}`);

      return;
    }

    const recordUrl = this.recordUrl('opportunity', params.opportunityId);

    const lines = [
      `⚠️ *Routing escalation* — ${params.reason}`,
      isDefined(params.attempts) ? `Attempts: ${params.attempts}` : undefined,
      recordUrl,
    ].filter(isDefined);

    await this.googleChatWebhookService.post(webhookUrl, {
      text: lines.join('\n'),
    });
  }

  // Ping the current owner when a claimed deal's contact re-engages (a new
  // inbound activity attached to the open deal).
  async notifyReengagement(
    authContext: WorkspaceAuthContext,
    params: { opportunityId: string; managerId: string },
  ): Promise<void> {
    const workspaceId = authContext.workspace?.id;

    if (!isDefined(workspaceId)) {
      return;
    }

    const details = await this.loadDealDetails(
      workspaceId,
      params.opportunityId,
      params.managerId,
    );

    if (
      await this.isMuted(
        workspaceId,
        details.managerUserId,
        NOTIFICATION_EVENTS.INBOUND_REENGAGED,
      )
    ) {
      return;
    }

    const webhookUrl = await this.resolveManagerWebhookUrl(
      workspaceId,
      details.managerUserId,
    );

    if (!isDefined(webhookUrl)) {
      this.logger.warn(
        'No webhook configured — skipping re-engagement notice.',
      );

      return;
    }

    await this.googleChatWebhookService.post(
      webhookUrl,
      this.buildDealCard({
        title: '🔁 Deal re-engaged — your client messaged again',
        subtitle: 'ENSO CRM · Inbound',
        rows: this.dealRows(details),
        recordUrl: this.recordUrl('opportunity', params.opportunityId),
        buttonText: 'Open conversation',
      }),
    );
  }

  // The deal left this manager (owner changed away) — tell the former owner.
  async notifyLostReassigned(
    authContext: WorkspaceAuthContext,
    params: { opportunityId: string; managerId: string },
  ): Promise<void> {
    const workspaceId = authContext.workspace?.id;

    if (!isDefined(workspaceId)) {
      return;
    }

    const details = await this.loadDealDetails(
      workspaceId,
      params.opportunityId,
      params.managerId,
    );

    if (
      await this.isMuted(
        workspaceId,
        details.managerUserId,
        NOTIFICATION_EVENTS.LEAD_LOST,
      )
    ) {
      return;
    }

    const webhookUrl = await this.resolveManagerWebhookUrl(
      workspaceId,
      details.managerUserId,
    );

    if (!isDefined(webhookUrl)) {
      return;
    }

    await this.googleChatWebhookService.post(
      webhookUrl,
      this.buildDealCard({
        title: '🔁 Deal reassigned away from you',
        subtitle: 'ENSO CRM · Routing',
        rows: this.dealRows(details),
        recordUrl: this.recordUrl('opportunity', params.opportunityId),
        buttonText: 'Open in CRM',
      }),
    );
  }

  // A deal you own changed stage/state and you didn't do it (someone else or
  // ENSO automation). Message varies by the pipeline-state transition.
  async notifyDealStateChanged(
    authContext: WorkspaceAuthContext,
    params: {
      opportunityId: string;
      managerId: string;
      transition: DealStateTransition;
      newStage?: string;
    },
  ): Promise<void> {
    const workspaceId = authContext.workspace?.id;

    if (!isDefined(workspaceId)) {
      return;
    }

    const details = await this.loadDealDetails(
      workspaceId,
      params.opportunityId,
      params.managerId,
    );

    if (
      await this.isMuted(
        workspaceId,
        details.managerUserId,
        NOTIFICATION_EVENTS.DEAL_STATE_CHANGED,
      )
    ) {
      return;
    }

    const webhookUrl = await this.resolveManagerWebhookUrl(
      workspaceId,
      details.managerUserId,
    );

    if (!isDefined(webhookUrl)) {
      return;
    }

    const title = this.dealStateTitle(params.transition, params.newStage);

    await this.googleChatWebhookService.post(
      webhookUrl,
      this.buildDealCard({
        title,
        subtitle: 'ENSO CRM · Deal update',
        rows: this.dealRows(details),
        recordUrl: this.recordUrl('opportunity', params.opportunityId),
        buttonText: 'Open in CRM',
      }),
    );
  }

  // A task was assigned to this manager (by the system or someone else).
  async notifyTaskAssigned(
    authContext: WorkspaceAuthContext,
    params: { taskId: string; managerId: string },
  ): Promise<void> {
    const workspaceId = authContext.workspace?.id;

    if (!isDefined(workspaceId)) {
      return;
    }

    const managerUserId = await this.loadManagerUserId(
      workspaceId,
      params.managerId,
    );

    if (
      await this.isMuted(
        workspaceId,
        managerUserId,
        NOTIFICATION_EVENTS.TASK_ASSIGNED,
      )
    ) {
      return;
    }

    const webhookUrl = await this.resolveManagerWebhookUrl(
      workspaceId,
      managerUserId,
    );

    if (!isDefined(webhookUrl)) {
      return;
    }

    const task = await this.loadTaskDetails(workspaceId, params.taskId);

    const rows = [
      task.title
        ? { icon: 'DESCRIPTION', label: 'Task', text: task.title }
        : undefined,
      task.dealName
        ? { icon: 'STORE', label: 'Deal', text: task.dealName }
        : undefined,
      task.contactName
        ? { icon: 'PERSON', label: 'Contact', text: task.contactName }
        : undefined,
      task.dueAt
        ? { icon: 'CLOCK', label: 'Due', text: this.formatDate(task.dueAt) }
        : undefined,
    ].filter(isDefined);

    await this.googleChatWebhookService.post(
      webhookUrl,
      this.buildDealCard({
        title: '⏰ New task assigned to you',
        subtitle: 'ENSO CRM · Task',
        rows,
        recordUrl: this.recordUrl('task', params.taskId),
        buttonText: 'Open task',
      }),
    );
  }

  // A task assigned to this manager has reached its due time (cron scanner).
  async notifyTaskDue(
    authContext: WorkspaceAuthContext,
    params: { taskId: string; managerId: string },
  ): Promise<void> {
    const workspaceId = authContext.workspace?.id;

    if (!isDefined(workspaceId)) {
      return;
    }

    const managerUserId = await this.loadManagerUserId(
      workspaceId,
      params.managerId,
    );

    if (
      await this.isMuted(
        workspaceId,
        managerUserId,
        NOTIFICATION_EVENTS.TASK_DUE,
      )
    ) {
      return;
    }

    const webhookUrl = await this.resolveManagerWebhookUrl(
      workspaceId,
      managerUserId,
    );

    if (!isDefined(webhookUrl)) {
      return;
    }

    const task = await this.loadTaskDetails(workspaceId, params.taskId);

    const rows = [
      task.title
        ? { icon: 'DESCRIPTION', label: 'Task', text: task.title }
        : undefined,
      task.dealName
        ? { icon: 'STORE', label: 'Deal', text: task.dealName }
        : undefined,
      task.contactName
        ? { icon: 'PERSON', label: 'Contact', text: task.contactName }
        : undefined,
      task.dueAt
        ? { icon: 'CLOCK', label: 'Due', text: this.formatDate(task.dueAt) }
        : undefined,
    ].filter(isDefined);

    await this.googleChatWebhookService.post(
      webhookUrl,
      this.buildDealCard({
        title: '⏰ Task due now',
        subtitle: 'ENSO CRM · Task',
        rows,
        recordUrl: this.recordUrl('task', params.taskId),
        buttonText: 'Open task',
      }),
    );
  }

  // Consent changed for a person on a project this manager is assigned to.
  async notifyConsentChange(
    authContext: WorkspaceAuthContext,
    params: {
      personId: string;
      projectId: string;
      managerId: string;
    },
  ): Promise<void> {
    const workspaceId = authContext.workspace?.id;

    if (!isDefined(workspaceId)) {
      return;
    }

    const managerUserId = await this.loadManagerUserId(
      workspaceId,
      params.managerId,
    );

    if (
      await this.isMuted(
        workspaceId,
        managerUserId,
        NOTIFICATION_EVENTS.CONSENT_CHANGED,
      )
    ) {
      return;
    }

    const webhookUrl = await this.resolveManagerWebhookUrl(
      workspaceId,
      managerUserId,
    );

    if (!isDefined(webhookUrl)) {
      return;
    }

    const context = await this.loadConsentContext(
      workspaceId,
      params.personId,
      params.projectId,
    );

    const rows = [
      context.who
        ? { icon: 'PERSON', label: 'Contact', text: context.who }
        : undefined,
      context.projectName
        ? { icon: 'DESCRIPTION', label: 'Project', text: context.projectName }
        : undefined,
    ].filter(isDefined);

    await this.googleChatWebhookService.post(
      webhookUrl,
      this.buildDealCard({
        title: '🔐 Consent updated for your contact',
        subtitle: 'ENSO CRM · Consent',
        rows,
        recordUrl: this.recordUrl('person', params.personId),
        buttonText: 'Open contact',
      }),
    );
  }

  private dealStateTitle(
    transition: DealStateTransition,
    newStage?: string,
  ): string {
    switch (transition) {
      case 'stalled':
        return '🪫 Your deal stalled';
      case 'deferred':
        return '💤 Your deal was deferred';
      case 'active':
        return '✅ Your deal is active again';
      default:
        return isDefined(newStage)
          ? `📊 Your deal moved to ${newStage}`
          : '📊 Your deal was updated';
    }
  }

  private dealRows(details: {
    dealName?: string;
    projectName?: string;
    who?: string;
    phone?: string;
    source?: string;
  }): Array<{ icon: string; label: string; text: string }> {
    return [
      details.dealName
        ? { icon: 'DESCRIPTION', label: 'Deal', text: details.dealName }
        : undefined,
      details.projectName
        ? { icon: 'STORE', label: 'Project', text: details.projectName }
        : undefined,
      details.who
        ? { icon: 'PERSON', label: 'Contact', text: details.who }
        : undefined,
      details.phone
        ? { icon: 'PHONE', label: 'Phone', text: details.phone }
        : undefined,
      details.source
        ? { icon: 'STAR', label: 'Source', text: details.source }
        : undefined,
    ].filter(isDefined);
  }

  private formatDate(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? String(value) : date.toUTCString();
  }

  // Build a Google Chat card: a row per detail + an Open button when a record
  // URL is available.
  private buildDealCard(params: {
    title: string;
    subtitle: string;
    rows: Array<{ icon: string; label: string; text: string }>;
    recordUrl: string | undefined;
    buttonText: string;
  }): Record<string, unknown> {
    const widgets: Record<string, unknown>[] = params.rows.map((row) => ({
      decoratedText: {
        startIcon: { knownIcon: row.icon },
        topLabel: row.label,
        text: row.text,
      },
    }));

    if (isDefined(params.recordUrl)) {
      widgets.push({
        buttonList: {
          buttons: [
            {
              text: params.buttonText,
              onClick: { openLink: { url: params.recordUrl } },
            },
          ],
        },
      });
    }

    return {
      cardsV2: [
        {
          cardId: 'enso-deal',
          card: {
            header: { title: params.title, subtitle: params.subtitle },
            sections: [{ widgets }],
          },
        },
      ],
    };
  }

  private async loadManagerUserId(
    workspaceId: string,
    managerId: string,
  ): Promise<string | undefined> {
    const systemAuthContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<any>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        const manager = await workspaceMemberRepository.findOne({
          where: { id: managerId },
        });

        return manager?.userId ?? undefined;
      },
      systemAuthContext,
    );
  }

  private async loadTaskDetails(
    workspaceId: string,
    taskId: string,
  ): Promise<{
    title?: string;
    dueAt?: Date | string;
    contactName?: string;
    dealName?: string;
  }> {
    const systemAuthContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const taskRepository =
          await this.globalWorkspaceOrmManager.getRepository<any>(
            workspaceId,
            'task',
            { shouldBypassPermissionChecks: true },
          );

        const task = await taskRepository.findOne({ where: { id: taskId } });

        // Tasks link to records polymorphically via taskTarget — surface the
        // related contact + deal so the manager knows what the task is about.
        const taskTargetRepository =
          await this.globalWorkspaceOrmManager.getRepository<any>(
            workspaceId,
            'taskTarget',
            { shouldBypassPermissionChecks: true },
          );

        const targets = await taskTargetRepository.find({ where: { taskId } });

        let contactName: string | undefined;
        const personTarget = targets.find(
          (target: { targetPersonId?: string }) =>
            isDefined(target.targetPersonId),
        );

        if (isDefined(personTarget?.targetPersonId)) {
          const personRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'person',
              { shouldBypassPermissionChecks: true },
            );

          const person = await personRepository.findOne({
            where: { id: personTarget.targetPersonId },
          });

          const fullName =
            `${person?.name?.firstName ?? ''} ${person?.name?.lastName ?? ''}`.trim();

          contactName = fullName || undefined;
        }

        let dealName: string | undefined;
        const opportunityTarget = targets.find(
          (target: { targetOpportunityId?: string }) =>
            isDefined(target.targetOpportunityId),
        );

        if (isDefined(opportunityTarget?.targetOpportunityId)) {
          const opportunityRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'opportunity',
              { shouldBypassPermissionChecks: true },
            );

          const opportunity = await opportunityRepository.findOne({
            where: { id: opportunityTarget.targetOpportunityId },
          });

          dealName = opportunity?.name ?? undefined;
        }

        return {
          title: task?.title ?? undefined,
          dueAt: task?.dueAt ?? undefined,
          contactName,
          dealName,
        };
      },
      systemAuthContext,
    );
  }

  private async loadConsentContext(
    workspaceId: string,
    personId: string,
    projectId: string,
  ): Promise<{ who?: string; projectName?: string }> {
    const systemAuthContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository<any>(
            workspaceId,
            'person',
            { shouldBypassPermissionChecks: true },
          );

        const person = await personRepository.findOne({
          where: { id: personId },
        });

        const fullName =
          `${person?.name?.firstName ?? ''} ${person?.name?.lastName ?? ''}`.trim();

        const projectRepository =
          await this.globalWorkspaceOrmManager.getRepository<any>(
            workspaceId,
            'project',
            { shouldBypassPermissionChecks: true },
          );

        const project = await projectRepository.findOne({
          where: { id: projectId },
        });

        return {
          who: fullName || undefined,
          projectName: project?.name ?? undefined,
        };
      },
      systemAuthContext,
    );
  }

  private async loadDealDetails(
    workspaceId: string,
    opportunityId: string,
    managerId: string,
  ): Promise<{
    dealName?: string;
    managerName?: string;
    managerUserId?: string;
    projectName?: string;
    who?: string;
    phone?: string;
    m2?: number;
    source?: string;
  }> {
    const systemAuthContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const opportunityRepository =
          await this.globalWorkspaceOrmManager.getRepository<any>(
            workspaceId,
            'opportunity',
            { shouldBypassPermissionChecks: true },
          );

        const opportunity = await opportunityRepository.findOne({
          where: { id: opportunityId },
        });

        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<any>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        const manager = await workspaceMemberRepository.findOne({
          where: { id: managerId },
        });

        const managerName = manager
          ? `${manager.name?.firstName ?? ''} ${manager.name?.lastName ?? ''}`.trim()
          : undefined;

        let projectName: string | undefined;

        if (isDefined(opportunity?.projectId)) {
          const projectRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'project',
              { shouldBypassPermissionChecks: true },
            );

          const project = await projectRepository.findOne({
            where: { id: opportunity.projectId },
          });

          projectName = project?.name ?? undefined;
        }

        let who: string | undefined;
        let phone: string | undefined;

        if (isDefined(opportunity?.pointOfContactId)) {
          const personRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'person',
              { shouldBypassPermissionChecks: true },
            );

          const person = await personRepository.findOne({
            where: { id: opportunity.pointOfContactId },
          });

          const fullName =
            `${person?.name?.firstName ?? ''} ${person?.name?.lastName ?? ''}`.trim();

          who = fullName || undefined;
          phone = readPersonPhoneE164(person);
        }

        return {
          dealName: opportunity?.name ?? undefined,
          managerName: managerName || undefined,
          managerUserId: manager?.userId ?? undefined,
          projectName,
          who,
          phone,
          m2: opportunity?.m2Min ?? undefined,
          source: opportunity?.source ?? undefined,
        };
      },
      systemAuthContext,
    );
  }
}
