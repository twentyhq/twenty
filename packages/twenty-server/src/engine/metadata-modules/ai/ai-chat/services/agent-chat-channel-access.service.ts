import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { RolePermissionsService } from 'src/engine/permissions/role-permissions.service';
import { AgentChatChannelMetadataService } from 'src/engine/metadata-modules/agent-chat-channel/services/agent-chat-channel-metadata.service';
import { type FlatAgentChatChannelWithRoleIds } from 'src/engine/metadata-modules/agent-chat-channel/types/flat-agent-chat-channel-with-role-ids.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type AgentChatChannelAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-access-args.type';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentInboxCallerAuthContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-caller-auth-context.type';
import { isAgentChatChannelOpenToRole } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-channel-open-to-role.util';
import { throwAgentChatChannelNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-not-found.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type MemberArgs = Omit<AgentChatThreadAccessArgs, 'threadId'>;

@Injectable()
export class AgentChatChannelAccessService {
  constructor(
    private readonly channelMetadataService: AgentChatChannelMetadataService,
    private readonly rolePermissionsService: RolePermissionsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly principalPermissionsReadService: PrincipalPermissionsReadService,
  ) {}

  async findCallerAccessibleChannels(
    authContext: AgentInboxCallerAuthContext,
  ): Promise<FlatAgentChatChannelWithRoleIds[]> {
    const [channels, role] = await Promise.all([
      this.channelMetadataService.findChannels(authContext.workspace.id),
      this.findCallerRole(authContext),
    ]);

    return channels.filter((channel) =>
      isAgentChatChannelOpenToRole({ channel, role }),
    );
  }

  async assertChannelAccess({
    channelId,
    ...memberArgs
  }: AgentChatChannelAccessArgs): Promise<FlatAgentChatChannelWithRoleIds> {
    return this.findChannelOpenToRoleOrThrow({
      workspaceId: memberArgs.workspaceId,
      channelId,
      findRole: () => this.findMemberRole(memberArgs),
    });
  }

  async assertCallerChannelAccessOrThrow({
    authContext,
    channelId,
  }: {
    authContext: AgentInboxCallerAuthContext;
    channelId: string;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    return this.findChannelOpenToRoleOrThrow({
      workspaceId: authContext.workspace.id,
      channelId,
      findRole: () => this.findCallerRole(authContext),
    });
  }

  async findCallerRole(
    authContext: AgentInboxCallerAuthContext,
  ): Promise<FlatRole | undefined> {
    const [principals, { flatRoleMaps }] = await Promise.all([
      this.principalPermissionsReadService.resolvePermissionsPrincipals({
        authContext,
      }),
      this.workspaceCacheService.getOrRecompute(authContext.workspace.id, [
        'flatRoleMaps',
      ]),
    ]);

    return isDefined(principals)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: principals.mainPrincipal.roleId,
          flatEntityMaps: flatRoleMaps,
        })
      : undefined;
  }

  private async findChannelOpenToRoleOrThrow({
    workspaceId,
    channelId,
    findRole,
  }: {
    workspaceId: string;
    channelId: string;
    findRole: () => Promise<FlatRole | undefined>;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const [channel, role] = await Promise.all([
      this.channelMetadataService.findChannelOrThrow({
        workspaceId,
        channelId,
      }),
      findRole(),
    ]);

    if (!isAgentChatChannelOpenToRole({ channel, role })) {
      throwAgentChatChannelNotFound();
    }

    return channel;
  }

  private async findMemberRole({
    workspaceId,
    workspaceMemberId,
  }: MemberArgs): Promise<FlatRole | undefined> {
    const [[roleId], { flatRoleMaps }] = await Promise.all([
      this.rolePermissionsService.findWorkspaceMemberRoleIds({
        workspaceId,
        workspaceMemberIds: [workspaceMemberId],
      }),
      this.workspaceCacheService.getOrRecompute(workspaceId, ['flatRoleMaps']),
    ]);

    return isDefined(roleId)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: roleId,
          flatEntityMaps: flatRoleMaps,
        })
      : undefined;
  }
}
