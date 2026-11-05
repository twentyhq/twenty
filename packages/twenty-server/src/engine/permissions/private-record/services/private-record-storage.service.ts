/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/created-by-workspace-member-id-column-name.constant';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { RecordPrivacyWriteOrmService } from 'src/engine/permissions/record-permission-orm/services/record-privacy-write-orm.service';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/record-permission-orm/utils/build-workspace-table-expression.util';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';
import { hasCreatedByField } from 'src/engine/permissions/private-record/utils/has-created-by-field.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@Injectable()
export class PrivateRecordStorageService {
  constructor(
    private readonly recordPrivacyWriteOrmService: RecordPrivacyWriteOrmService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
  ) {}

  async grantPrivateRecordsCreatedBy({
    workspaceId,
    flatObjectMetadatas,
    creatorWorkspaceMemberId,
    granteeWorkspaceMemberId,
  }: {
    workspaceId: string;
    flatObjectMetadatas: FlatObjectMetadata[];
    creatorWorkspaceMemberId: string;
    granteeWorkspaceMemberId: string;
  }): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const objectsWithCreator = flatObjectMetadatas.filter(
      (flatObjectMetadata) =>
        !isPermissionStorageObject(flatObjectMetadata) &&
        hasCreatedByField({ flatObjectMetadata, flatFieldMetadataMaps }),
    );

    if (!isNonEmptyArray(objectsWithCreator)) {
      return;
    }

    const privateRecordSelects = objectsWithCreator.map(
      (flatObjectMetadata, index) =>
        `SELECT CAST(:objectMetadataId${index} AS uuid) AS "objectMetadataId", "id" AS "recordId" FROM ${buildTableExpression({ workspaceId, flatObjectMetadata })} WHERE ${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} AND ${escapeIdentifier(CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME)} = :creatorWorkspaceMemberId`,
    );

    await this.recordShareStorageService.insertOwnerGrantsFromSelect({
      workspaceId,
      recordSelect: privateRecordSelects.join(' UNION ALL '),
      parameters: {
        creatorWorkspaceMemberId,
        ...Object.fromEntries(
          objectsWithCreator.map(({ id }, index) => [
            `objectMetadataId${index}`,
            id,
          ]),
        ),
      },
      granteeWorkspaceMemberId,
    });
  }

  setPrivate({
    workspaceId,
    flatObjectMetadata,
    recordIds,
    isPrivate,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordIds: string[];
    isPrivate: boolean;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    return this.recordPrivacyWriteOrmService.setRecordsPrivate({
      workspaceId,
      flatObjectMetadata,
      recordIds,
      isPrivate,
      transactionScope,
    });
  }
}

const buildTableExpression = ({
  workspaceId,
  flatObjectMetadata,
}: {
  workspaceId: string;
  flatObjectMetadata: Parameters<typeof computeObjectTargetTable>[0];
}): string =>
  buildWorkspaceTableExpression({
    workspaceId,
    tableName: computeObjectTargetTable(flatObjectMetadata),
  });
