/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsService } from 'src/engine/permissions/permissions.service';
import { RecordShareWriteOrmService } from 'src/engine/permissions/record-permission-orm/services/record-share-write-orm.service';
import { type RecordSharingDTO } from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';
import {
  type RecordSharingObject,
  resolveRecordSharingObjectOrThrow,
} from 'src/engine/permissions/record-share/utils/resolve-record-sharing-object-or-throw.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type RecordSharingChange = {
  workspaceId: string;
  transactionScope: WorkspaceTransactionScope;
  sharingObject: RecordSharingObject;
  creatorWorkspaceMemberId: string | undefined;
};

@Injectable()
export class RecordSharingChangeService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareWriteOrmService: RecordShareWriteOrmService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async runChange({
    args,
    write,
  }: {
    args: RecordSharingArgs;
    write: (change: RecordSharingChange) => Promise<void>;
  }): Promise<RecordSharingDTO> {
    const { flatObjectMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(
        args.authContext.workspace.id,
        ['flatObjectMetadataMaps', 'featureFlagsMap'],
      );
    const sharingObject = resolveRecordSharingObjectOrThrow({
      objectMetadataId: args.objectMetadataId,
      flatObjectMetadataMaps,
      featureFlagsMap,
    });
    const { flatObjectMetadata } = sharingObject;
    const workspaceId = args.authContext.workspace.id;

    if (!sharingObject.isShareable) {
      throw new NotFoundError('Record not found');
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            await this.recordShareWriteOrmService.lockRecordForSharingChange({
              workspaceId,
              flatObjectMetadata,
              recordId: args.recordId,
              transactionScope,
            });
            const repository = transactionScope.getRepository(
              flatObjectMetadata.nameSingular,
            );
            const writableIds =
              await repository.findRecordIdsAllowedForOperation({
                recordIds: [args.recordId],
                operationType: 'update',
                withDeleted: true,
              });
            if (
              writableIds.length !== 1 ||
              !repository.isObjectOperationPermittedByRole('update')
            ) {
              throw new NotFoundError('Record not found');
            }
            const { viewerAccessLevel, creatorWorkspaceMemberId } =
              await this.permissionsService.findViewerRecordAccess({
                ...args,
                transactionScope,
              });
            if (viewerAccessLevel !== RecordShareAccessLevel.FULL) {
              throw new NotFoundError('Record not found');
            }
            await write({
              workspaceId,
              transactionScope,
              sharingObject,
              creatorWorkspaceMemberId,
            });
          },
        ),
      args.authContext,
    );

    return this.permissionsService.findRecordSharingAfterChange(args);
  }
}
