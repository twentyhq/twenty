import { Injectable } from '@nestjs/common';

import { RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';

const NON_TERMINAL_CALL_RECORDING_STATUSES: CallRecordingStatus[] = [
  CallRecordingStatus.SCHEDULED,
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
];

@Injectable()
export class CallRecordingService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  async findCallRecordingIdForCalendarEvent(
    calendarEventId: string,
  ): Promise<string | undefined> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const callRecordingRepository =
        this.workspaceOrmManager.getRepository<CallRecordingWorkspaceEntity>(
          'callRecording',
        );

      const { permissionsPrincipals, objectIdByNameSingular } =
        getWorkspaceContext();

      if (
        !(await this.recordPermissionsService.canRoleAccessSomeRecords({
          operationType: 'read',
          principals: permissionsPrincipals,
          objectMetadataId: objectIdByNameSingular.callRecording,
        }))
      ) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }

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
      const nonTerminalCallRecording = callRecordingsByCreation.find(
        (callRecording) =>
          NON_TERMINAL_CALL_RECORDING_STATUSES.includes(callRecording.status),
      );

      return (
        completedCallRecording ??
        nonTerminalCallRecording ??
        callRecordingsByCreation[0]
      )?.id;
    });
  }
}
