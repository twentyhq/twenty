import { Injectable } from '@nestjs/common';

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
    const isAllowed = (
      recordId: string,
      operationType: 'update' | 'delete' | 'soft-delete',
    ) =>
      allowedRecordIds.select.has(recordId) &&
      allowedRecordIds[operationType].has(recordId);

    return new Map(
      recordIds.map((recordId) => [
        recordId,
        {
          canRead: allowedRecordIds.select.has(recordId),
          canUpdate: isAllowed(recordId, 'update'),
          canDelete: isAllowed(recordId, 'delete'),
          canSoftDelete: isAllowed(recordId, 'soft-delete'),
        },
      ]),
    );
  }
}
