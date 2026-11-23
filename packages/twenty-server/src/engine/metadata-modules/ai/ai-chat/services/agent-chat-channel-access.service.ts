import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { AgentChatChannelMetadataService } from 'src/engine/metadata-modules/agent-chat-channel/services/agent-chat-channel-metadata.service';
import { type FlatAgentChatChannelWithRoleIds } from 'src/engine/metadata-modules/agent-chat-channel/types/flat-agent-chat-channel-with-role-ids.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type AgentChatChannelAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-access-args.type';
import { type AgentInboxCallerAuthContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-caller-auth-context.type';
import { isAgentChatChannelOpenToRoles } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-channel-open-to-roles.util';
import { throwAgentChatChannelNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-not-found.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentChatChannelAccessService {
  constructor(
    private readonly channelMetadataService: AgentChatChannelMetadataService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly principalPermissionsReadService: PrincipalPermissionsReadService,
  ) {}

  async findCallerAccessibleChannels(
    authContext: AgentInboxCallerAuthContext,
  ): Promise<FlatAgentChatChannelWithRoleIds[]> {
    const [channels, roles] = await Promise.all([
      this.channelMetadataService.findChannels(authContext.workspace.id),
      this.findCallerRoles(authContext),
    ]);

    return channels.filter((channel) =>
      isAgentChatChannelOpenToRoles({ channel, roles }),
    );
  }

  async assertChannelAccess({
    channelId,
    ...memberArgs
  }: AgentChatChannelAccessArgs): Promise<FlatAgentChatChannelWithRoleIds> {
    return this.findChannelOpenToRolesOrThrow({
      workspaceId: memberArgs.workspaceId,
      channelId,
      findRoles: () =>
        this.findCallerRoles({
          type: 'user',
          workspace: { id: memberArgs.workspaceId },
          workspaceMemberId: memberArgs.workspaceMemberId,
        }),
    });
  }

  async assertCallerChannelAccessOrThrow({
    authContext,
    channelId,
  }: {
    authContext: AgentInboxCallerAuthContext;
    channelId: string;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    return this.findChannelOpenToRolesOrThrow({
      workspaceId: authContext.workspace.id,
      channelId,
      findRoles: () => this.findCallerRoles(authContext),
    });
  }

  async findCallerRoles(
    authContext: PermissionsAuthContext,
  ): Promise<FlatRole[]> {
    const [principals, { flatRoleMaps }] = await Promise.all([
      this.principalPermissionsReadService.resolvePermissionsPrincipals({
        authContext,
      }),
      this.workspaceCacheService.getOrRecompute(authContext.workspace.id, [
        'flatRoleMaps',
      ]),
    ]);

    return (isDefined(principals) ? principals.mainPrincipal.roleIds : [])
      .map((roleId) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: roleId,
          flatEntityMaps: flatRoleMaps,
        }),
      )
      .filter(isDefined);
  }

  private async findChannelOpenToRolesOrThrow({
    workspaceId,
    channelId,
    findRoles,
  }: {
    workspaceId: string;
    channelId: string;
    findRoles: () => Promise<FlatRole[]>;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const [channel, roles] = await Promise.all([
      this.channelMetadataService.findChannelOrThrow({
        workspaceId,
        channelId,
      }),
      findRoles(),
    ]);

    if (!isAgentChatChannelOpenToRoles({ channel, roles })) {
      throwAgentChatChannelNotFound();
    }

    return channel;
  }
}
