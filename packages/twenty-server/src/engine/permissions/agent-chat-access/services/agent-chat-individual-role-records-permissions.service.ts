import { Injectable } from '@nestjs/common';

import { type ObjectRecordsPermissionsManifest } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildAgentChatObjectsRecordsPermissions } from 'src/engine/permissions/agent-chat-access/utils/build-agent-chat-objects-records-permissions.util';
import { resolveUserWorkspaceIdsWithPermissionFlag } from 'src/engine/permissions/role/utils/resolve-user-workspace-ids-with-permission-flag.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentChatIndividualRoleRecordsPermissionsService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentChatChannelEntity)
    private readonly channelRepository: WorkspaceScopedRepository<AgentChatChannelEntity>,
    @InjectWorkspaceScopedRepository(AgentChatChannelRoleEntity)
    private readonly channelRoleRepository: WorkspaceScopedRepository<AgentChatChannelRoleEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async buildByUserWorkspaceId({
    workspaceId,
    userWorkspaceIds,
  }: {
    workspaceId: string;
    userWorkspaceIds: string[];
  }): Promise<Map<string, ObjectRecordsPermissionsManifest[]>> {
    const {
      flatWorkspaceMemberMaps,
      flatRoleMaps,
      flatRolePermissionFlagMaps,
      flatRoleTargetMaps,
      userWorkspaceRoleMap,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatWorkspaceMemberMaps',
      'flatRoleMaps',
      'flatRolePermissionFlagMaps',
      'flatRoleTargetMaps',
      'userWorkspaceRoleMap',
    ]);

    const [channels, channelRoles] = await Promise.all([
      this.channelRepository.find(workspaceId, { select: { id: true } }),
      this.channelRoleRepository.find(workspaceId, {
        select: { channelId: true, roleId: true },
      }),
    ]);

    const userWorkspaceIdsWithAiAccess = new Set(
      resolveUserWorkspaceIdsWithPermissionFlag({
        permissionFlag: PermissionFlagType.AI,
        flatRoleMaps,
        flatRolePermissionFlagMaps,
        flatRoleTargetMaps,
      }),
    );
    const allChannelIds = channels.map(({ id }) => id);

    const findReadableChannelIds = (userWorkspaceId: string): string[] => {
      const roleIds = new Set(userWorkspaceRoleMap[userWorkspaceId] ?? []);
      const canAccessAllChannels = [...roleIds].some(
        (roleId) =>
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: roleId,
            flatEntityMaps: flatRoleMaps,
          })?.canAccessAllAgentChatChannels === true,
      );

      if (canAccessAllChannels) {
        return allChannelIds;
      }

      return [
        ...new Set(
          channelRoles
            .filter(({ roleId }) => roleIds.has(roleId))
            .map(({ channelId }) => channelId),
        ),
      ];
    };

    return new Map(
      userWorkspaceIds.flatMap((userWorkspaceId) => {
        const workspaceMemberId =
          flatWorkspaceMemberMaps.idByUserWorkspaceId[userWorkspaceId];

        if (!isDefined(workspaceMemberId)) {
          return [];
        }

        return [
          [
            userWorkspaceId,
            buildAgentChatObjectsRecordsPermissions({
              userWorkspaceId,
              workspaceMemberId,
              hasAiAccess: userWorkspaceIdsWithAiAccess.has(userWorkspaceId),
              readableChannelIds: findReadableChannelIds(userWorkspaceId),
            }),
          ],
        ];
      }),
    );
  }
}
