import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type RealMeetingRecordingAggregate } from 'src/modules/calendar/calendar-event-recording-manager/types/real-meeting-recording-aggregate.type';
import { type RemovedRecordingOccurrence } from 'src/modules/calendar/calendar-event-recording-manager/types/removed-recording-occurrence.type';
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

type CalendarEventRecordingReconciliationAction =
  | 'CREATED'
  | 'UPDATED'
  | 'CANCELED'
  | 'SKIPPED';

export type CalendarEventRecordingReconciliationResult = {
  action: CalendarEventRecordingReconciliationAction;
  realMeetingKey: string;
  callRecordingId: string | null;
};

@Injectable()
export class CalendarEventRecordingReconciliationService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async reconcileMeetingOccurrences({
    workspaceId,
    meetingAggregates,
    removedOccurrences = [],
  }: {
    workspaceId: string;
    meetingAggregates: RealMeetingRecordingAggregate[];
    removedOccurrences?: RemovedRecordingOccurrence[];
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

        for (const aggregate of [
          ...meetingAggregates.filter(
            (meetingAggregate) =>
              meetingAggregate.providerIntent === 'CANCELED',
          ),
          ...meetingAggregates.filter(
            (meetingAggregate) => meetingAggregate.providerIntent === 'ACTIVE',
          ),
        ]) {
          if (aggregate.providerIntent === 'ACTIVE') {
            results.push(
              await reconcileActiveMeeting({
                aggregate,
                calendarEventRepository,
                callRecordingRepository,
              }),
            );
          } else {
            results.push(
              await reconcileCanceledMeeting({
                aggregate,
                removedCalendarEventIds:
                  removedCalendarEventIdsByMeetingKey.get(
                    aggregate.realMeetingKey,
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
  aggregate,
  calendarEventRepository,
  callRecordingRepository,
}: {
  aggregate: RealMeetingRecordingAggregate;
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
    ...aggregate.calendarEventIds,
    ...aggregate.activeCalendarEventIds,
  ]);

  const representativeCalendarEventId = getUniqueSortedCalendarEventIds(
    aggregate.activeCalendarEventIds,
  )[0];

  if (!isDefined(representativeCalendarEventId)) {
    return {
      action: 'SKIPPED',
      realMeetingKey: aggregate.realMeetingKey,
      callRecordingId: null,
    };
  }

  const representativeCalendarEvent = await calendarEventRepository.findOne({
    where: { id: representativeCalendarEventId },
  });

  if (!isDefined(representativeCalendarEvent)) {
    return {
      action: 'SKIPPED',
      realMeetingKey: aggregate.realMeetingKey,
      callRecordingId: null,
    };
  }

  const existingCallRecording = getFirstActiveLifecycleCallRecording(
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
      realMeetingKey: aggregate.realMeetingKey,
      callRecordingId: existingCallRecording.id,
    };
  }

  const insertResult =
    await callRecordingRepository.insert(callRecordingFields);

  return {
    action: 'CREATED',
    realMeetingKey: aggregate.realMeetingKey,
    callRecordingId: insertResult.identifiers[0]?.id ?? null,
  };
};

const reconcileCanceledMeeting = async ({
  aggregate,
  removedCalendarEventIds,
  callRecordingRepository,
}: {
  aggregate: RealMeetingRecordingAggregate;
  removedCalendarEventIds: string[];
  callRecordingRepository: Pick<
    WorkspaceRepository<CallRecordingWorkspaceEntity>,
    'find' | 'updateMany'
  >;
}): Promise<CalendarEventRecordingReconciliationResult> => {
  const calendarEventIds = getUniqueSortedCalendarEventIds([
    ...aggregate.calendarEventIds,
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
      realMeetingKey: aggregate.realMeetingKey,
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
    realMeetingKey: aggregate.realMeetingKey,
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
  removedOccurrences: RemovedRecordingOccurrence[],
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

const getFirstActiveLifecycleCallRecording = (
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
