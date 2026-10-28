import { Injectable } from '@nestjs/common';

import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { RecordSharePrincipalService } from 'src/engine/core-modules/record-share/services/record-share-principal.service';
import { AgentChatChannelMetadataService } from 'src/engine/metadata-modules/agent-chat-channel/services/agent-chat-channel-metadata.service';
import { type FlatAgentChatChannelWithRoleIds } from 'src/engine/metadata-modules/agent-chat-channel/types/flat-agent-chat-channel-with-role-ids.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type AgentChatCaller } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-caller.type';
import { type AgentChatChannelAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-access-args.type';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { isAgentChatChannelOpenToRole } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-channel-open-to-role.util';
import { throwAgentChatChannelNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-not-found.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type MemberArgs = Omit<AgentChatThreadAccessArgs, 'threadId'>;

@Injectable()
export class AgentChatChannelAccessService {
  constructor(
    private readonly channelMetadataService: AgentChatChannelMetadataService,
    private readonly recordSharePrincipalService: RecordSharePrincipalService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async findAccessibleChannels(
    args: MemberArgs,
  ): Promise<FlatAgentChatChannelWithRoleIds[]> {
    const [channels, role] = await Promise.all([
      this.channelMetadataService.findChannels(args.workspaceId),
      this.findMemberRole(args),
    ]);

    return channels.filter((channel) =>
      isAgentChatChannelOpenToRole({ channel, role }),
    );
  }

  async assertChannelAccess({
    channelId,
    ...memberArgs
  }: AgentChatChannelAccessArgs): Promise<FlatAgentChatChannelWithRoleIds> {
    return this.assertChannelOpenToRole({
      workspaceId: memberArgs.workspaceId,
      channelId,
      role: await this.findMemberRole(memberArgs),
    });
  }

  async assertChannelOpenToRole({
    workspaceId,
    channelId,
    role,
  }: {
    workspaceId: string;
    channelId: string;
    role: FlatRole | undefined;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const channel = await this.channelMetadataService.findChannelOrThrow({
      workspaceId,
      channelId,
    });

    if (!isAgentChatChannelOpenToRole({ channel, role })) {
      throwAgentChatChannelNotFound();
    }

    return channel;
  }

  async findCallerRole({
    workspaceId,
    caller,
  }: {
    workspaceId: string;
    caller: AgentChatCaller;
  }): Promise<FlatRole | undefined> {
    if (caller.type === 'application') {
      return this.findApplicationRole({
        workspaceId,
        application: caller.application,
      });
    }

    return this.findMemberRole({
      workspaceId,
      workspaceMemberId: caller.workspaceMemberId,
    });
  }

  async findMemberRole({
    workspaceId,
    workspaceMemberId,
  }: MemberArgs): Promise<FlatRole | undefined> {
    const [[roleId], { flatRoleMaps }] = await Promise.all([
      this.recordSharePrincipalService.resolveRoleIds({
        workspaceId,
        principals: [
          {
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            principalId: workspaceMemberId,
          },
        ],
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

  private async findApplicationRole({
    workspaceId,
    application: { defaultRoleId },
  }: {
    workspaceId: string;
    application: Pick<FlatApplication, 'defaultRoleId'>;
  }): Promise<FlatRole | undefined> {
    if (!isDefined(defaultRoleId)) {
      return undefined;
    }

    const { flatRoleMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatRoleMaps'],
    );

    return findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: defaultRoleId,
      flatEntityMaps: flatRoleMaps,
    });
  }
}
