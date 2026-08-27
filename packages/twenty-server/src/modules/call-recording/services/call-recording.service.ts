import { Injectable } from '@nestjs/common';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';

const IN_PROGRESS_CALL_RECORDING_STATUSES: CallRecordingStatus[] = [
  CallRecordingStatus.SCHEDULED,
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
];

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

      const callRecordingsByCreation = await callRecordingRepository.find({
        where: { calendarEventId },
        select: { id: true, status: true },
        order: {
          createdAt: { order: 'ASC', nulls: 'NULLS LAST' },
          id: 'ASC',
        },
      });

      const completedCallRecording = callRecordingsByCreation.find(
        (callRecording) =>
          callRecording.status === CallRecordingStatus.COMPLETED,
      );
      const inProgressCallRecording = callRecordingsByCreation.find(
        (callRecording) =>
          IN_PROGRESS_CALL_RECORDING_STATUSES.includes(callRecording.status),
      );

      return (
        completedCallRecording ??
        inProgressCallRecording ??
        callRecordingsByCreation[0]
      )?.id;
    });
  }
}
