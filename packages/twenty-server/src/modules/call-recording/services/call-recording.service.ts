import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';

const IN_PROGRESS_CALL_RECORDING_STATUSES = [
  CallRecordingStatus.SCHEDULED,
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
];

const CALL_RECORDING_SELECTION_ORDER = {
  createdAt: { order: 'ASC' as const, nulls: 'NULLS LAST' as const },
  id: 'ASC' as const,
};

@Injectable()
export class CallRecordingService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async findCallRecordingIdForCalendarEvent(
    calendarEventId: string,
  ): Promise<string | undefined> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const callRecordingRepository =
        this.workspaceOrmManager.getRepository<CallRecordingWorkspaceEntity>(
          'callRecording',
        );

      const completedCallRecording = await callRecordingRepository.findOne({
        where: {
          calendarEventId,
          status: CallRecordingStatus.COMPLETED,
        },
        select: { id: true },
        order: CALL_RECORDING_SELECTION_ORDER,
      });

      if (isDefined(completedCallRecording)) {
        return completedCallRecording.id;
      }

      const inProgressCallRecording = await callRecordingRepository.findOne({
        where: {
          calendarEventId,
          status: In(IN_PROGRESS_CALL_RECORDING_STATUSES),
        },
        select: { id: true },
        order: CALL_RECORDING_SELECTION_ORDER,
      });

      if (isDefined(inProgressCallRecording)) {
        return inProgressCallRecording.id;
      }

      const firstCallRecording = await callRecordingRepository.findOne({
        where: { calendarEventId },
        select: { id: true },
        order: CALL_RECORDING_SELECTION_ORDER,
      });

      return firstCallRecording?.id;
    });
  }
}
