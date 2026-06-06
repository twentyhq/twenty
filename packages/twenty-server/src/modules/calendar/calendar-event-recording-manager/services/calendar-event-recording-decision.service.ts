import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarEventRecordingDecisionResult } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-decision-result.type';
import { type CalendarEventRecordingDecisionForMeeting } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-decision-for-meeting.type';
import { type RemovedCalendarEventRecordingOccurrence } from 'src/modules/calendar/calendar-event-recording-manager/types/removed-calendar-event-recording-occurrence.type';
import { aggregateCalendarEventRecordingDecisionsByMeeting } from 'src/modules/calendar/calendar-event-recording-manager/utils/aggregate-calendar-event-recording-decisions-by-meeting.util';
import { buildCalendarEventRecordingDecision } from 'src/modules/calendar/calendar-event-recording-manager/utils/build-calendar-event-recording-decision.util';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

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
      await this.isRecordingEnabledForWorkspace(workspaceId);

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

        const decision = buildCalendarEventRecordingDecision(calendarEvent, {
          isRecordingEnabledForWorkspace,
          now: new Date(),
        });

        return {
          workspaceId,
          calendarEventId,
          found: true,
          recordingPreference: decision.recordingPreference,
          realMeetingKey: decision.realMeetingKey,
          eventIntent: decision.eventIntent,
          reason: decision.reason,
        };
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  // Re-evaluate the current event set so one OFF duplicate does not cancel an active duplicate.
  async evaluateMeetingOccurrences({
    workspaceId,
    calendarEventIds,
    removedOccurrences = [],
  }: {
    workspaceId: string;
    calendarEventIds: string[];
    removedOccurrences?: RemovedCalendarEventRecordingOccurrence[];
  }): Promise<CalendarEventRecordingDecisionForMeeting[]> {
    const isRecordingEnabledForWorkspace =
      await this.isRecordingEnabledForWorkspace(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const calendarEventRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
            workspaceId,
            'calendarEvent',
          );
        const now = new Date();

        const changedCalendarEvents =
          calendarEventIds.length > 0
            ? await calendarEventRepository.find({
                where: { id: In(calendarEventIds) },
                relations: ['calendarEventParticipants'],
              })
            : [];

        const affectedMeetingKeys = new Set<string>();
        const occurrenceStartsAtAnchors = new Set<string>();

        for (const changedCalendarEvent of changedCalendarEvents) {
          affectedMeetingKeys.add(
            buildCalendarEventRecordingDecision(changedCalendarEvent, {
              isRecordingEnabledForWorkspace,
              now,
            }).realMeetingKey,
          );

          if (isDefined(changedCalendarEvent.startsAt)) {
            occurrenceStartsAtAnchors.add(changedCalendarEvent.startsAt);
          }
        }

        for (const removedOccurrence of removedOccurrences) {
          affectedMeetingKeys.add(removedOccurrence.realMeetingKey);

          if (isDefined(removedOccurrence.startsAt)) {
            occurrenceStartsAtAnchors.add(removedOccurrence.startsAt);
          }
        }

        if (affectedMeetingKeys.size === 0) {
          return [];
        }

        // The derived meeting key includes startsAt, so startsAt is the narrowest available
        // repository filter for loading current duplicate events.
        const occurrenceSiblingEvents =
          occurrenceStartsAtAnchors.size > 0
            ? await calendarEventRepository.find({
                where: { startsAt: In([...occurrenceStartsAtAnchors]) },
                relations: ['calendarEventParticipants'],
              })
            : [];

        // A changed event with a null start is not returned by the anchor query; keep it so a
        // link-less, iCalUid-less occurrence still evaluates against itself.
        const occurrenceEventsById = new Map<
          string,
          CalendarEventWorkspaceEntity
        >();

        for (const calendarEvent of [
          ...occurrenceSiblingEvents,
          ...changedCalendarEvents,
        ]) {
          occurrenceEventsById.set(calendarEvent.id, calendarEvent);
        }

        const perEventRecordingDecisions = [...occurrenceEventsById.values()]
          .map((calendarEvent) =>
            buildCalendarEventRecordingDecision(calendarEvent, {
              isRecordingEnabledForWorkspace,
              now,
            }),
          )
          .filter((decision) =>
            affectedMeetingKeys.has(decision.realMeetingKey),
          )
          .map((decision) => ({
            calendarEventId: decision.calendarEventId,
            realMeetingKey: decision.realMeetingKey,
            eventIntent: decision.eventIntent,
          }));

        const meetingDecisions =
          aggregateCalendarEventRecordingDecisionsByMeeting(
            perEventRecordingDecisions,
          );

        // If every event was removed, there is no per-event decision to aggregate.
        const meetingKeysWithDecision = new Set(
          meetingDecisions.map(
            (meetingDecision) => meetingDecision.realMeetingKey,
          ),
        );

        for (const meetingKey of affectedMeetingKeys) {
          if (!meetingKeysWithDecision.has(meetingKey)) {
            meetingDecisions.push({
              realMeetingKey: meetingKey,
              meetingRecordingIntent: 'CANCELED',
              calendarEventIds: [],
              activeCalendarEventIds: [],
            });
          }
        }

        return meetingDecisions;
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  private async isRecordingEnabledForWorkspace(
    workspaceId: string,
  ): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_CALL_RECORDING_ENABLED,
      workspaceId,
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
