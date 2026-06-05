import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarEventRecordingDecisionResult } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-decision-result.type';
import { type RealMeetingRecordingAggregate } from 'src/modules/calendar/calendar-event-recording-manager/types/real-meeting-recording-aggregate.type';
import { type RemovedRecordingOccurrence } from 'src/modules/calendar/calendar-event-recording-manager/types/removed-recording-occurrence.type';
import { aggregateRecordingIntentByMeeting } from 'src/modules/calendar/calendar-event-recording-manager/utils/aggregate-recording-intent-by-meeting.util';
import { buildCalendarEventRecordingDecision } from 'src/modules/calendar/calendar-event-recording-manager/utils/build-calendar-event-recording-decision.util';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

// Stateless: reads calendar events and returns their recording decisions. Nothing is persisted.
@Injectable()
export class CalendarEventRecordingDecisionService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  // Single calendar event, for the QA command. The decision is per-event, not per-meeting.
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

  // Re-evaluates every real meeting touched by a change from its CURRENT full set of calendar
  // events, so one OFF copy never cancels a meeting another copy still wants recorded. A bot is
  // requested when at least one surviving event for the meeting is ACTIVE.
  async evaluateMeetingOccurrences({
    workspaceId,
    calendarEventIds,
    removedOccurrences = [],
  }: {
    workspaceId: string;
    calendarEventIds: string[];
    removedOccurrences?: RemovedRecordingOccurrence[];
  }): Promise<RealMeetingRecordingAggregate[]> {
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

        // Every event sharing an occurrence key also shares its start, so the start is a precise
        // anchor for loading all current calendar events that belong to the affected meetings.
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

        const perEventIntents = [...occurrenceEventsById.values()]
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

        const aggregates = aggregateRecordingIntentByMeeting(perEventIntents);

        // An occurrence whose every calendar event was removed yields no intent; emit an explicit
        // CANCELED aggregate so the dispatcher tears down a bot no event still wants.
        const aggregatedMeetingKeys = new Set(
          aggregates.map((aggregate) => aggregate.realMeetingKey),
        );

        for (const meetingKey of affectedMeetingKeys) {
          if (!aggregatedMeetingKeys.has(meetingKey)) {
            aggregates.push({
              realMeetingKey: meetingKey,
              providerIntent: 'CANCELED',
              calendarEventIds: [],
              activeCalendarEventIds: [],
            });
          }
        }

        return aggregates;
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
