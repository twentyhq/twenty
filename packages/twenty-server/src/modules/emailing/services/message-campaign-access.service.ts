import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class MessageCampaignAccessService {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async assertCanReadCampaigns({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<void> {
    const campaignPermissions = await this.findCampaignPermissions({
      workspaceId,
      userWorkspaceId,
    });

    if (!campaignPermissions?.canReadObjectRecords) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }

  async assertCanReadAndUpdateCampaigns({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<void> {
    const campaignPermissions = await this.findCampaignPermissions({
      workspaceId,
      userWorkspaceId,
    });

    if (
      !campaignPermissions?.canReadObjectRecords ||
      !campaignPermissions.canUpdateObjectRecords
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }

  private async findCampaignPermissions({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<ObjectPermissions | undefined> {
    const [{ objectsPermissions }, { flatObjectMetadataMaps }] =
      await Promise.all([
        this.permissionsService.getUserWorkspacePermissions({
          workspaceId,
          userWorkspaceId,
        }),
        this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
        ]),
      ]);

    const campaignObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.messageCampaign.universalIdentifier
      ];

    return isDefined(campaignObjectMetadata)
      ? objectsPermissions[campaignObjectMetadata.id]
      : undefined;
  }
}
