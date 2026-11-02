import { Injectable } from '@nestjs/common';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordPermissionsDTO } from 'src/engine/permissions/record-permissions/dtos/record-permissions.dto';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

@Injectable()
export class RecordPermissionsService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async getPermissionsForRecords({
    authContext,
    flatObjectMetadata,
    recordIds,
    transactionScope,
  }: {
    authContext: WorkspaceAuthContext;
    flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular'>;
    recordIds: string[];
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<Map<string, RecordPermissionsDTO>> {
    const allowedRecordIds =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepositoryWithContextPermissions(
              flatObjectMetadata.nameSingular,
              transactionScope,
            )
            .findRecordIdsAllowedForOperations({
              recordIds,
              operationTypes: ['select', 'update', 'delete', 'soft-delete'],
            }),
        authContext,
      );
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
