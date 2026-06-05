import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarEventRecordingDecisionResult } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording.types';
import { computeRealMeetingKey } from 'src/modules/calendar/calendar-event-recording-manager/utils/compute-real-meeting-key.util';
import { evaluateCalendarEventRecordingDecision } from 'src/modules/calendar/calendar-event-recording-manager/utils/evaluate-calendar-event-recording-decision.util';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

// Stateless: reads a calendar event and returns its recording decision. Nothing is persisted.
// The provider-dispatch PR consumes realMeetingKey to perform the idempotent bot upsert.
@Injectable()
export class CalendarEventRecordingDecisionService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async evaluateCalendarEvent({
    workspaceId,
    calendarEventId,
  }: {
    workspaceId: string;
    calendarEventId: string;
  }): Promise<CalendarEventRecordingDecisionResult> {
    const isRecordingEnabledForWorkspace =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_CALL_RECORDING_ENABLED,
        workspaceId,
      );

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const calendarEventRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
            workspaceId,
            'calendarEvent',
          );

        const calendarEvent = await calendarEventRepository.findOne({
          where: { id: calendarEventId },
          relations: ['calendarEventParticipants'],
        });

        if (!isDefined(calendarEvent)) {
          return buildNotFoundResult({ workspaceId, calendarEventId });
        }

        const conferenceLinkUrl =
          calendarEvent.conferenceLink?.primaryLinkUrl ?? null;

        const realMeetingKey = computeRealMeetingKey({
          calendarEventId,
          conferenceLinkUrl,
          iCalUid: calendarEvent.iCalUid,
          startsAt: calendarEvent.startsAt,
        });

        const hasExternalParticipant = (
          calendarEvent.calendarEventParticipants ?? []
        ).some((participant) => !isDefined(participant.workspaceMemberId));

        const { eventIntent, reason } = evaluateCalendarEventRecordingDecision({
          input: {
            recordingPreference: calendarEvent.recordingPreference,
            isCanceled: calendarEvent.isCanceled,
            startsAt: calendarEvent.startsAt,
            endsAt: calendarEvent.endsAt,
            conferenceLinkUrl,
            hasExternalParticipant,
          },
          now: new Date(),
          isRecordingEnabledForWorkspace,
        });

        return {
          workspaceId,
          calendarEventId,
          found: true,
          recordingPreference: calendarEvent.recordingPreference,
          realMeetingKey,
          eventIntent,
          reason,
        };
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }
}

const buildNotFoundResult = ({
  workspaceId,
  calendarEventId,
}: {
  workspaceId: string;
  calendarEventId: string;
}): CalendarEventRecordingDecisionResult => ({
  workspaceId,
  calendarEventId,
  found: false,
  recordingPreference: null,
  realMeetingKey: null,
  eventIntent: null,
  reason: null,
});
