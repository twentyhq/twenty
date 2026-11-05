import { Injectable } from '@nestjs/common';

import { type ObjectRecordsOperationType } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordAccessPolicyService } from 'src/engine/permissions/combine/services/record-access-policy.service';
import { type RecordPermissionsDTO } from 'src/engine/permissions/record-permissions/dtos/record-permissions.dto';

@Injectable()
export class RecordPermissionsService {
  constructor(
    private readonly recordAccessPolicyService: RecordAccessPolicyService,
  ) {}

  async getPermissionsForRecords({
    authContext,
    objectNameSingular,
    recordIds,
  }: {
    authContext: WorkspaceAuthContext;
    objectNameSingular: string;
    recordIds: string[];
  }): Promise<Map<string, RecordPermissionsDTO>> {
    const allowedRecordIds =
      await this.recordAccessPolicyService.findGrantedRecordIdsByOperationType({
        authContext,
        objectNameSingular,
        recordIds,
        operationTypes: ['select', 'update', 'delete', 'soft-delete'],
      });
    const isGranted = (
      recordId: string,
      operationType: ObjectRecordsOperationType,
    ) => allowedRecordIds.get(operationType)?.has(recordId) ?? false;
    const isAllowed = (
      recordId: string,
      operationType: ObjectRecordsOperationType,
    ) => isGranted(recordId, 'select') && isGranted(recordId, operationType);

    return new Map(
      recordIds.map((recordId) => [
        recordId,
        {
          canRead: isGranted(recordId, 'select'),
          canUpdate: isAllowed(recordId, 'update'),
          canDelete: isAllowed(recordId, 'delete'),
          canSoftDelete: isAllowed(recordId, 'soft-delete'),
        },
      ]),
    );
  }
}
