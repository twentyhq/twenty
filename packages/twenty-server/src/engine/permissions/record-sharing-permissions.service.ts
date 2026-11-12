/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { RecordSharePrincipalType } from 'twenty-shared/types';

import { RecordPermissionReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-permission-read.repository';
import { RecordSharingReadService } from 'src/engine/permissions/record-share/services/record-sharing-read.service';
import { type RecordSharingDTO } from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';

@Injectable()
export class RecordSharingPermissionsService {
  constructor(
    private readonly recordPermissionReadRepository: RecordPermissionReadRepository,
    private readonly recordSharingReadService: RecordSharingReadService,
  ) {}

  findRecordSharingPanel(args: RecordSharingArgs): Promise<RecordSharingDTO> {
    return this.recordSharingReadService.findRecordSharingPanel(args);
  }

  canManageRecordSharing(args: RecordSharingArgs): Promise<boolean> {
    return this.recordSharingReadService.canManageRecordSharing(args);
  }

  async isRecordSharedBeyondMember({
    workspaceId,
    objectMetadataId,
    recordId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordId: string;
    workspaceMemberId: string;
  }): Promise<boolean> {
    const recordShares =
      await this.recordPermissionReadRepository.findRecordShares({
        workspaceId,
        objectMetadataId,
        recordIds: [recordId],
      });

    return recordShares.some(
      ({ principalType, principalId }) =>
        principalType !== RecordSharePrincipalType.WORKSPACE_MEMBER ||
        principalId !== workspaceMemberId,
    );
  }
}
