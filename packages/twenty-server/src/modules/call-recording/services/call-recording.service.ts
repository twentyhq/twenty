import { Injectable } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';

import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { resolveObjectRecordsPermissions } from 'src/engine/twenty-orm/utils/resolve-object-records-permissions.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
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
      const workspaceContext = getWorkspaceContext();
      const rolePermissionConfig = resolveRolePermissionConfig({
        authContext: workspaceContext.authContext,
        userWorkspaceRoleMap: workspaceContext.userWorkspaceRoleMap,
        apiKeyRoleMap: workspaceContext.apiKeyRoleMap,
      });

      if (!isDefined(rolePermissionConfig)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }

      const { objectRecordsPermissions, shouldBypassPermissionChecks } =
        resolveObjectRecordsPermissions({
          rolePermissionConfig,
          objectPermissionsByRoleId: workspaceContext.permissionsPerRoleId,
        });
      const callRecordingObjectMetadataId =
        workspaceContext.objectIdByNameSingular.callRecording;

      if (
        !shouldBypassPermissionChecks &&
        (!isDefined(callRecordingObjectMetadataId) ||
          !objectRecordsPermissions[callRecordingObjectMetadataId]
            ?.canReadObjectRecords)
      ) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }

      const callRecordingRepository =
        this.workspaceOrmManager.getRepository<CallRecordingWorkspaceEntity>(
          'callRecording',
          rolePermissionConfig,
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
