/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { RecordAccessGroupPropagationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-propagation.service';
import { isAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/is-access-groups-enabled.util';
import { PrivateRecordRepository } from 'src/engine/permissions/internal/private-record/repositories/private-record.repository';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class PrivateRecordSystemWriteService {
  constructor(
    private readonly privateRecordRepository: PrivateRecordRepository,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordAccessGroupPropagationService: RecordAccessGroupPropagationService,
  ) {}

  async setRecordsPrivacy({
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
    const { flatObjectMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'featureFlagsMap',
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

    await this.privateRecordRepository.setRecordsPrivate({
      workspaceId,
      flatObjectMetadata,
      recordIds,
      isPrivate,
      transactionScope,
    });

    if (isAccessGroupsEnabled({ featureFlagsMap })) {
      await this.recordAccessGroupPropagationService.recomputeRecordsFollowingRelatedRecordPathsInWrite(
        { workspaceId, objectMetadataId, recordIds, transactionScope },
      );
    }
  }
}
