import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarEventRecordingPolicyResultForMeeting } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-policy-result-for-meeting.type';
import { type CalendarEventRecordingReconciliationResult } from 'src/modules/calendar/calendar-event-recording-manager/types/calendar-event-recording-reconciliation-result.type';
import { type RemovedCalendarEventRecordingOccurrence } from 'src/modules/calendar/calendar-event-recording-manager/types/removed-calendar-event-recording-occurrence.type';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';

const CALL_RECORDING_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CANCELED: 'CANCELED',
  COMPLETED: 'COMPLETED',
} as const;

type ScheduledCallRecordingFields = Pick<
  CallRecordingWorkspaceEntity,
  'title' | 'status' | 'startedAt' | 'endedAt' | 'calendarEventId'
>;

@Injectable()
export class CalendarEventRecordingReconciliationService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async reconcileMeetingOccurrences({
    workspaceId,
    meetingPolicyResults,
    removedOccurrences = [],
  }: {
    workspaceId: string;
    meetingPolicyResults: CalendarEventRecordingPolicyResultForMeeting[];
    removedOccurrences?: RemovedCalendarEventRecordingOccurrence[];
  }): Promise<CalendarEventRecordingReconciliationResult[]> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const calendarEventRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarEventWorkspaceEntity>(
            workspaceId,
            'calendarEvent',
          );

        const callRecordingRepository =
          await this.globalWorkspaceOrmManager.getRepository<CallRecordingWorkspaceEntity>(
            workspaceId,
            'callRecording',
          );

        const removedCalendarEventIdsByMeetingKey =
          buildRemovedCalendarEventIdsByMeetingKey(removedOccurrences);
        const results: CalendarEventRecordingReconciliationResult[] = [];

        for (const meetingPolicyResult of [
          ...meetingPolicyResults.filter(
            (meetingPolicyResult) => !meetingPolicyResult.shouldRecord,
          ),
          ...meetingPolicyResults.filter(
            (meetingPolicyResult) => meetingPolicyResult.shouldRecord,
          ),
        ]) {
          if (meetingPolicyResult.shouldRecord) {
            results.push(
              await reconcileActiveMeeting({
                meetingPolicyResult,
                removedCalendarEventIds:
                  removedCalendarEventIdsByMeetingKey.get(
                    meetingPolicyResult.realMeetingKey,
                  ) ?? [],
                calendarEventRepository,
                callRecordingRepository,
              }),
            );
          } else {
            results.push(
              await reconcileCanceledMeeting({
                meetingPolicyResult,
                removedCalendarEventIds:
                  removedCalendarEventIdsByMeetingKey.get(
                    meetingPolicyResult.realMeetingKey,
                  ) ?? [],
                callRecordingRepository,
              }),
            );
          }
        }

        return results;
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }
}

const reconcileActiveMeeting = async ({
  meetingPolicyResult,
  removedCalendarEventIds,
  calendarEventRepository,
  callRecordingRepository,
}: {
  meetingPolicyResult: CalendarEventRecordingPolicyResultForMeeting;
  removedCalendarEventIds: string[];
  calendarEventRepository: Pick<
    WorkspaceRepository<CalendarEventWorkspaceEntity>,
    'findOne'
  >;
  callRecordingRepository: Pick<
    WorkspaceRepository<CallRecordingWorkspaceEntity>,
    'find' | 'insert' | 'update'
  >;
}): Promise<CalendarEventRecordingReconciliationResult> => {
  const calendarEventIds = getUniqueSortedCalendarEventIds([
    ...meetingPolicyResult.calendarEventIds,
    ...meetingPolicyResult.recordingCalendarEventIds,
    ...removedCalendarEventIds,
  ]);

  const representativeCalendarEventId = getUniqueSortedCalendarEventIds(
    meetingPolicyResult.recordingCalendarEventIds,
  )[0];

  if (!isDefined(representativeCalendarEventId)) {
    return {
      action: 'SKIPPED',
      realMeetingKey: meetingPolicyResult.realMeetingKey,
      callRecordingId: null,
    };
  }

  const representativeCalendarEvent = await calendarEventRepository.findOne({
    where: { id: representativeCalendarEventId },
  });

  if (!isDefined(representativeCalendarEvent)) {
    return {
      action: 'SKIPPED',
      realMeetingKey: meetingPolicyResult.realMeetingKey,
      callRecordingId: null,
    };
  }

  const existingCallRecording = getFirstNonCompletedCallRecording(
    await findCallRecordingsByCalendarEventIds({
      callRecordingRepository,
      calendarEventIds,
    }),
  );
  const callRecordingFields = buildScheduledCallRecordingFields(
    representativeCalendarEvent,
  );

  if (isDefined(existingCallRecording)) {
    await callRecordingRepository.update(
      existingCallRecording.id,
      callRecordingFields,
    );

    return {
      action: 'UPDATED',
      realMeetingKey: meetingPolicyResult.realMeetingKey,
      callRecordingId: existingCallRecording.id,
    };
  }

  const insertResult =
    await callRecordingRepository.insert(callRecordingFields);

  return {
    action: 'CREATED',
    realMeetingKey: meetingPolicyResult.realMeetingKey,
    callRecordingId: insertResult.identifiers[0]?.id ?? null,
  };
};

const reconcileCanceledMeeting = async ({
  meetingPolicyResult,
  removedCalendarEventIds,
  callRecordingRepository,
}: {
  meetingPolicyResult: CalendarEventRecordingPolicyResultForMeeting;
  removedCalendarEventIds: string[];
  callRecordingRepository: Pick<
    WorkspaceRepository<CallRecordingWorkspaceEntity>,
    'find' | 'updateMany'
  >;
}): Promise<CalendarEventRecordingReconciliationResult> => {
  const calendarEventIds = getUniqueSortedCalendarEventIds([
    ...meetingPolicyResult.calendarEventIds,
    ...removedCalendarEventIds,
  ]);
  const cancellableCallRecordings = (
    await findCallRecordingsByCalendarEventIds({
      callRecordingRepository,
      calendarEventIds,
    })
  ).filter(
    (callRecording) =>
      callRecording.status !== CALL_RECORDING_STATUS.COMPLETED &&
      callRecording.status !== CALL_RECORDING_STATUS.CANCELED,
  );

  if (cancellableCallRecordings.length === 0) {
    return {
      action: 'SKIPPED',
      realMeetingKey: meetingPolicyResult.realMeetingKey,
      callRecordingId: null,
    };
  }

  await callRecordingRepository.updateMany(
    cancellableCallRecordings.map((callRecording) => ({
      criteria: callRecording.id,
      partialEntity: { status: CALL_RECORDING_STATUS.CANCELED },
    })),
  );

  return {
    action: 'CANCELED',
    realMeetingKey: meetingPolicyResult.realMeetingKey,
    callRecordingId: cancellableCallRecordings[0]?.id ?? null,
  };
};

const findCallRecordingsByCalendarEventIds = async ({
  callRecordingRepository,
  calendarEventIds,
}: {
  callRecordingRepository: Pick<
    WorkspaceRepository<CallRecordingWorkspaceEntity>,
    'find'
  >;
  calendarEventIds: string[];
}): Promise<CallRecordingWorkspaceEntity[]> => {
  if (calendarEventIds.length === 0) {
    return [];
  }

  return callRecordingRepository.find({
    where: { calendarEventId: In(calendarEventIds) },
  });
};

const buildScheduledCallRecordingFields = (
  calendarEvent: CalendarEventWorkspaceEntity,
): ScheduledCallRecordingFields => ({
  title: calendarEvent.title,
  status: CALL_RECORDING_STATUS.SCHEDULED,
  startedAt: calendarEvent.startsAt,
  endedAt: calendarEvent.endsAt,
  calendarEventId: calendarEvent.id,
});

const buildRemovedCalendarEventIdsByMeetingKey = (
  removedOccurrences: RemovedCalendarEventRecordingOccurrence[],
): Map<string, string[]> => {
  const calendarEventIdsByMeetingKey = new Map<string, string[]>();

  for (const removedOccurrence of removedOccurrences) {
    calendarEventIdsByMeetingKey.set(removedOccurrence.realMeetingKey, [
      ...(calendarEventIdsByMeetingKey.get(removedOccurrence.realMeetingKey) ??
        []),
      removedOccurrence.calendarEventId,
    ]);
  }

  return calendarEventIdsByMeetingKey;
};

const getFirstNonCompletedCallRecording = (
  callRecordings: CallRecordingWorkspaceEntity[],
): CallRecordingWorkspaceEntity | undefined =>
  [...callRecordings]
    .sort((firstCallRecording, secondCallRecording) =>
      firstCallRecording.id.localeCompare(secondCallRecording.id),
    )
    .find(
      (callRecording) =>
        callRecording.status !== CALL_RECORDING_STATUS.COMPLETED,
    );

const getUniqueSortedCalendarEventIds = (calendarEventIds: string[]) =>
  [...new Set(calendarEventIds)].sort(
    (firstCalendarEventId, secondCalendarEventId) =>
      firstCalendarEventId.localeCompare(secondCalendarEventId),
  );
