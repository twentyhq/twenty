import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarEventRecordingPolicyReason } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-reason.type';
import { type CalendarEventRecordingPolicyResultForMeeting } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-result-for-meeting.type';
import { type RemovedCalendarEventRecordingOccurrence } from 'src/modules/calendar/calendar-event-recording-manager/types/removed-calendar-event-recording-occurrence.type';
import { aggregateCalendarEventRecordingPolicyResultsByMeeting } from 'src/modules/calendar/calendar-event-recording-manager/utils/aggregate-calendar-event-recording-policy-results-by-meeting.util';
import { buildCalendarEventRecordingPolicyResult } from 'src/modules/calendar/calendar-event-recording-manager/utils/build-calendar-event-recording-policy-result.util';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

type FoundCalendarEventRecordingPolicyResult = {
  workspaceId: string;
  calendarEventId: string;
  found: true;
  recordingPreference: string;
  realMeetingKey: string;
  shouldRecord: boolean;
  reason: CalendarEventRecordingPolicyReason;
};

type NotFoundCalendarEventRecordingPolicyResult = {
  workspaceId: string;
  calendarEventId: string;
  found: false;
  recordingPreference: null;
  realMeetingKey: null;
  shouldRecord: null;
  reason: null;
};

type CalendarEventRecordingPolicyResultForCalendarEvent =
  | FoundCalendarEventRecordingPolicyResult
  | NotFoundCalendarEventRecordingPolicyResult;

@Injectable()
export class CalendarEventRecordingPolicyService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async resolveCalendarEventPolicyResult({
    workspaceId,
    calendarEventId,
  }: {
    workspaceId: string;
    calendarEventId: string;
  }): Promise<CalendarEventRecordingPolicyResultForCalendarEvent> {
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

        const policyResult = buildCalendarEventRecordingPolicyResult(
          calendarEvent,
          {
            isRecordingEnabledForWorkspace,
            now: new Date(),
          },
        );

        return {
          workspaceId,
          calendarEventId,
          found: true,
          recordingPreference: policyResult.recordingPreference,
          realMeetingKey: policyResult.realMeetingKey,
          shouldRecord: policyResult.shouldRecord,
          reason: policyResult.reason,
        };
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  // Re-resolve the current event set so one OFF duplicate does not cancel a recording duplicate.
  async resolveMeetingPolicyResults({
    workspaceId,
    calendarEventIds,
    removedOccurrences = [],
  }: {
    workspaceId: string;
    calendarEventIds: string[];
    removedOccurrences?: RemovedCalendarEventRecordingOccurrence[];
  }): Promise<CalendarEventRecordingPolicyResultForMeeting[]> {
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
            buildCalendarEventRecordingPolicyResult(changedCalendarEvent, {
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
        // link-less, iCalUid-less occurrence still resolves against itself.
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

        const perEventRecordingPolicyResults = [
          ...occurrenceEventsById.values(),
        ]
          .map((calendarEvent) =>
            buildCalendarEventRecordingPolicyResult(calendarEvent, {
              isRecordingEnabledForWorkspace,
              now,
            }),
          )
          .filter((policyResult) =>
            affectedMeetingKeys.has(policyResult.realMeetingKey),
          )
          .map((policyResult) => ({
            calendarEventId: policyResult.calendarEventId,
            realMeetingKey: policyResult.realMeetingKey,
            shouldRecord: policyResult.shouldRecord,
          }));

        const meetingPolicyResults =
          aggregateCalendarEventRecordingPolicyResultsByMeeting(
            perEventRecordingPolicyResults,
          );

        // If every event was removed, there is no per-event policy result to aggregate.
        const meetingKeysWithPolicyResult = new Set(
          meetingPolicyResults.map(
            (meetingPolicyResult) => meetingPolicyResult.realMeetingKey,
          ),
        );

        for (const meetingKey of affectedMeetingKeys) {
          if (!meetingKeysWithPolicyResult.has(meetingKey)) {
            meetingPolicyResults.push({
              realMeetingKey: meetingKey,
              shouldRecord: false,
              calendarEventIds: [],
              recordingCalendarEventIds: [],
            });
          }
        }

        return meetingPolicyResults;
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
}): CalendarEventRecordingPolicyResultForCalendarEvent => ({
  workspaceId,
  calendarEventId,
  found: false,
  recordingPreference: null,
  realMeetingKey: null,
  shouldRecord: null,
  reason: null,
});
