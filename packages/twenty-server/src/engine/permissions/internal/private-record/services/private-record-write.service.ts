/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME } from 'src/engine/permissions/internal/private-record/constants/created-by-workspace-member-id-column-name.constant';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { PrivateRecordRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/private-record.repository';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { RecordShareStorageService } from 'src/engine/permissions/internal/record-share/services/record-share-storage.service';
import { type RecordSharingDTO } from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import {
  type RecordSharingChange,
  RecordSharingChangeService,
} from 'src/engine/permissions/internal/record-share/services/record-sharing-change.service';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';
import { hasCreatedByField } from 'src/engine/permissions/internal/private-record/utils/has-created-by-field.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@Injectable()
export class PrivateRecordWriteService {
  constructor(
    private readonly privateRecordRepository: PrivateRecordRepository,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly recordSharingChangeService: RecordSharingChangeService,
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

  setRecordPrivacy(
    args: RecordSharingArgs & { isPrivate: boolean },
  ): Promise<RecordSharingDTO> {
    return this.recordSharingChangeService.runChange({
      args,
      write: (change) => this.writeRecordPrivacy({ ...change, args }),
      requiredCapability: 'canSetRecordPrivacy',
    });
  }

  async setPrivateOrThrow({
    workspaceId,
    objectMetadataId,
    recordIds,
    isPrivate,
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
    isPrivate: boolean;
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
        PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    return this.privateRecordRepository.setRecordsPrivate({
      workspaceId,
      flatObjectMetadata,
      recordIds,
      isPrivate,
      transactionScope,
    });
  }

  private async writeRecordPrivacy({
    workspaceId,
    transactionScope,
    sharingObject: { flatObjectMetadata, isShareable },
    creatorWorkspaceMemberId,
    args,
  }: RecordSharingChange & {
    args: RecordSharingArgs & { isPrivate: boolean };
  }): Promise<void> {
    const { isPrivate } = args;

    if (
      isPrivate &&
      !isShareable &&
      args.authContext.workspaceMemberId !== creatorWorkspaceMemberId
    ) {
      throw new NotFoundError('Record not found', {
        userFriendlyMessage: msg`Record not found`,
      });
    }

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    await this.setPrivateOrThrow({
      workspaceId,
      objectMetadataId: flatObjectMetadata.id,
      recordIds: [args.recordId],
      isPrivate,
      transactionScope,
    });

    if (!isPrivate) {
      if (!hasCreatedByField({ flatObjectMetadata, flatFieldMetadataMaps })) {
        return;
      }

      await this.recordShareStorageService.deleteMatching({
        workspaceId,
        transactionScope,
        criteria: {
          objectMetadataId: args.objectMetadataId,
          recordIds: [args.recordId],
          rowCause: RecordShareRowCause.OWNER,
        },
      });

      return;
    }

    await this.recordShareStorageService.deleteMatching({
      workspaceId,
      transactionScope,
      criteria: {
        objectMetadataId: args.objectMetadataId,
        recordIds: [args.recordId],
        principalType: RecordSharePrincipalType.EVERYONE,
        rowCause: RecordShareRowCause.MANUAL,
      },
    });

    if (args.authContext.workspaceMemberId === creatorWorkspaceMemberId) {
      return;
    }

    await this.recordShareStorageService.insertMany({
      workspaceId,
      transactionScope,
      recordShares: [
        {
          recordId: args.recordId,
          objectMetadataId: args.objectMetadataId,
          principalId: args.authContext.workspaceMemberId,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.OWNER,
          sourceId: args.recordId,
        },
      ],
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
