import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  buildProjectDealMessage,
  type ProjectDealFacts,
} from 'src/modules/enso/lead-pipeline/utils/build-project-deal-message.util';
import { ProjectChatWebhookService } from 'src/modules/enso/notifications/services/project-chat-webhook.service';
import { readPersonPhoneE164 } from 'src/modules/enso/shared/utils/person-phone.util';

// The MARKETING lane: one shared Google Chat space per development, posting
// every new deal with the attribution that opened it.
//
// Read by the marketing team, not by managers — so the message answers "which
// spend produced this?" rather than "claim this now". The per-manager private
// cards in ManagerNotificationService are unaffected and still fire; a new deal
// legitimately produces one post in each lane.
//
// Deliberately PLAIN TEXT in the exact shape the legacy n8n alerts used in these
// same rooms — labelled lines, the 37-underscore rule, then the utm_* block.
// Those rooms hold two years of history in that format, people quote and reply
// to individual lines, and a cardsV2 card would read as a different system
// arriving. Matching it means the CRM simply continues the feed.
//
// Posts only on deal CREATION. A re-engagement on an existing deal is not new
// demand, so counting it here would inflate whatever marketing measures from
// this feed.
@Injectable()
export class ProjectNotificationService {
  private readonly logger = new Logger(ProjectNotificationService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly projectChatWebhookService: ProjectChatWebhookService,
  ) {}

  private recordUrl(recordId: string): string | undefined {
    const base = (
      process.env.ENSO_CRM_APP_URL ||
      process.env.FRONTEND_URL ||
      ''
    ).replace(/\/$/, '');

    return base ? `${base}/object/opportunity/${recordId}` : undefined;
  }

  async notifyNewDeal(
    authContext: WorkspaceAuthContext,
    params: { opportunityId: string },
  ): Promise<void> {
    const workspaceId = authContext.workspace?.id;

    if (!isDefined(workspaceId)) {
      return;
    }

    const loaded = await this.loadFacts(workspaceId, params.opportunityId);

    if (!isDefined(loaded)) {
      return;
    }

    const { projectId, facts } = loaded;

    // A deal with no project has no room to post to. Not an error: unattributed
    // inbound exists, and the manager lane still covers it.
    if (!isDefined(projectId)) {
      return;
    }

    const webhookUrl = await this.projectChatWebhookService.getWebhookUrl({
      projectId,
      workspaceId,
    });

    if (!isDefined(webhookUrl)) {
      return;
    }

    const posted = await this.projectChatWebhookService.post(webhookUrl, {
      text: buildProjectDealMessage(
        facts,
        this.recordUrl(params.opportunityId),
      ),
    });

    if (posted) {
      this.logger.log(
        `Posted new deal ${params.opportunityId} to the ${facts.projectName ?? projectId} marketing space.`,
      );
    }
  }

  private async loadFacts(
    workspaceId: string,
    opportunityId: string,
  ): Promise<
    { projectId: string | undefined; facts: ProjectDealFacts } | undefined
  > {
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

        if (!isDefined(opportunity)) {
          return undefined;
        }

        let projectName: string | undefined;

        if (isDefined(opportunity.projectId)) {
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

        let fullName: string | undefined;
        let phone: string | undefined;
        let email: string | undefined;

        if (isDefined(opportunity.pointOfContactId)) {
          const personRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'person',
              { shouldBypassPermissionChecks: true },
            );

          const person = await personRepository.findOne({
            where: { id: opportunity.pointOfContactId },
          });

          const composed =
            `${person?.name?.firstName ?? ''} ${person?.name?.lastName ?? ''}`.trim();

          fullName = composed || undefined;
          phone = readPersonPhoneE164(person);
          email = person?.emails?.primaryEmail ?? undefined;
        }

        // The activity carries the per-touch detail the rooms show (status,
        // duration, dialled number, requested area) which the deal does not.
        // The deal's own utm_* snapshot is frozen first-touch and equals this
        // activity's on creation, so reading it here keeps one source.
        const activityRepository =
          await this.globalWorkspaceOrmManager.getRepository<any>(
            workspaceId,
            'inboundActivity',
            { shouldBypassPermissionChecks: true },
          );

        const activityRow = await activityRepository.findOne({
          where: { opportunityId },
          order: { occurredAt: 'ASC' },
        });

        return {
          projectId: opportunity.projectId ?? undefined,
          facts: {
            projectName,
            fullName,
            phone,
            email,
            activity: {
              kind: activityRow?.kind ?? undefined,
              source: activityRow?.source ?? undefined,
              // The platform names the room's channel (Instagram/Facebook) and
              // the traffic type separates an organic DM from a paid ad click —
              // both known at intake, so an untagged social lead can say which
              // it is instead of reading as a lost campaign.
              platform: activityRow?.platform ?? undefined,
              trafficType:
                activityRow?.trafficType ??
                opportunity.firstTrafficType ??
                undefined,
              callStatus: activityRow?.callStatus ?? undefined,
              durationS: activityRow?.durationS ?? undefined,
              calleeDid: activityRow?.calleeDid ?? undefined,
              landingPage:
                activityRow?.landingPage ??
                opportunity.firstLandingPage ??
                undefined,
              occurredAt:
                activityRow?.occurredAt ?? opportunity.createdAt ?? undefined,
              m2Requested: activityRow?.m2Requested ?? undefined,
              utmSource: opportunity.utmSource ?? undefined,
              utmMedium: opportunity.utmMedium ?? undefined,
              utmCampaign: opportunity.utmCampaign ?? undefined,
              utmContent: opportunity.utmContent ?? undefined,
              utmTerm: opportunity.utmTerm ?? undefined,
            },
          },
        };
      },
      systemAuthContext,
    );
  }
}
