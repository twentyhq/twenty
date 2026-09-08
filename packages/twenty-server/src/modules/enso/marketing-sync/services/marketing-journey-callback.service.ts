import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { SYSTEM_ACTOR } from 'src/modules/enso/lead-pipeline/lead-pipeline.constants';
import {
  type JourneyCallbackInput,
  type MarketingEnrollmentStatus,
} from 'src/modules/enso/marketing-sync/dtos/journey-callback.input';
import {
  buildEnsoTimelineInserts,
  type EnsoTimelineSegment,
} from 'src/modules/enso/timeline/enso-timeline.util';

// Records marketing-journey state pushed back from Dittofeed (connection (4)).
// Dittofeed exposes NO journey-position API, so we don't poll it — each
// milestone is pushed here by a Webhook-channel Message node, and the upserted
// `marketingEnrollment` row IS the CRM's knowledge of where the person sits in
// the journey. We also drop a green-sentence timeline event so the activity is
// visible on the person (and the triggering opportunity) immediately.
@Injectable()
export class MarketingJourneyCallbackService {
  private readonly logger = new Logger(MarketingJourneyCallbackService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async recordEvent(input: JourneyCallbackInput): Promise<void> {
    const {
      workspaceId,
      userId,
      journey,
      step,
      status,
      occurredAt,
      dittofeedJourneyId,
      sourceOpportunityId,
    } = input;

    const happenedAt = isDefined(occurredAt)
      ? occurredAt
      : new Date().toISOString();

    // No auth context on an unauthenticated webhook — load a system context for
    // the supplied workspace, same as the consent/company-link services.
    const authContext = buildSystemAuthContext(workspaceId);

    const optional = {
      ...(isDefined(dittofeedJourneyId) ? { dittofeedJourneyId } : {}),
      ...(isDefined(sourceOpportunityId) ? { sourceOpportunityId } : {}),
    };

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const enrollmentRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'marketingEnrollment',
          { shouldBypassPermissionChecks: true },
        );

      // One row per (person × journey) — upsert on re-entry/progression.
      const existing = await enrollmentRepository.findOne({
        where: { personId: userId, journey },
      });

      if (existing) {
        await enrollmentRepository.update(
          { id: existing.id },
          {
            status,
            currentStep: step,
            lastEventAt: happenedAt,
            // Raw updates bypass the resolver that fills the updatedBy ACTOR
            // (updatedByName is NOT NULL).
            updatedBy: SYSTEM_ACTOR,
            ...optional,
          },
        );
      } else {
        await enrollmentRepository.insert({
          name: `${journey} · ${status}`,
          personId: userId,
          journey,
          status,
          currentStep: step,
          enteredAt: happenedAt,
          lastEventAt: happenedAt,
          // Raw inserts bypass the resolver that fills createdBy/updatedBy
          // ACTORs (createdByName / updatedByName are NOT NULL on custom objects).
          createdBy: SYSTEM_ACTOR,
          updatedBy: SYSTEM_ACTOR,
          ...optional,
        });
      }

      await this.writeTimeline({
        workspaceId,
        userId,
        journey,
        step,
        status,
        happenedAt,
        sourceOpportunityId,
      });
    }, authContext);
  }

  // Best-effort: a timeline failure must not roll back the enrollment write.
  private async writeTimeline(params: {
    workspaceId: string;
    userId: string;
    journey: string;
    step: string;
    status: MarketingEnrollmentStatus;
    happenedAt: string;
    sourceOpportunityId?: string;
  }): Promise<void> {
    try {
      const timelineRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          params.workspaceId,
          'timelineActivity',
          { shouldBypassPermissionChecks: true },
        );

      const rows = buildEnsoTimelineInserts({
        action: `marketing-${params.status.toLowerCase()}`,
        target: {
          personId: params.userId,
          ...(isDefined(params.sourceOpportunityId)
            ? { opportunityId: params.sourceOpportunityId }
            : {}),
        },
        segments: this.buildSegments(
          params.journey,
          params.step,
          params.status,
        ),
        auto: true,
        happensAt: params.happenedAt,
      });

      if (rows.length > 0) {
        await timelineRepository.insert(rows);
      }
    } catch (error) {
      this.logger.warn(
        `marketing timeline write failed for person ${params.userId}: ${
          (error as Error).message
        }`,
      );
    }
  }

  private buildSegments(
    journey: string,
    step: string,
    status: MarketingEnrollmentStatus,
  ): EnsoTimelineSegment[] {
    if (status === 'FINISHED') {
      return [{ text: `Completed the ${journey} marketing sequence` }];
    }

    if (status === 'EXITED') {
      return [{ text: `Exited the ${journey} marketing sequence` }];
    }

    if (/enter/i.test(step)) {
      return [{ text: `Entered the ${journey} marketing sequence` }];
    }

    return [{ text: `Reached "${step}" in the ${journey} marketing sequence` }];
  }
}
