import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { ChannelVisibilityRuleSyncSchedulerService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync-scheduler.service';
import { isWorkspaceMemberIndividualRole } from 'src/engine/permissions/workspace-member-individual-role/utils/is-workspace-member-individual-role.util';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

const findEventEntity = <TMetadataName extends 'role' | 'roleTarget'>(
  event: MetadataEvent<TMetadataName>,
) =>
  event.type === 'deleted' ? event.properties.before : event.properties.after;

// The individual role sync writes roles and role targets itself, so its own events are skipped
@Injectable()
export class AgentChatIndividualRoleSyncListener {
  constructor(
    private readonly channelVisibilityRuleSyncSchedulerService: ChannelVisibilityRuleSyncSchedulerService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @OnEvent('metadata.agentChatChannel.created')
  @OnEvent('metadata.agentChatChannel.deleted')
  @OnEvent('metadata.agentChatChannelRole.*')
  @OnEvent('metadata.rolePermissionFlag.*')
  async handleChannelAccessChanged({
    workspaceId,
  }: Pick<MetadataEventBatch, 'workspaceId'>): Promise<void> {
    await this.channelVisibilityRuleSyncSchedulerService.scheduleSyncIfEnabled(
      workspaceId,
    );
  }

  @OnEvent('metadata.role.*')
  async handleRoleChanged({
    workspaceId,
    events,
  }: MetadataEventBatch<'role'>): Promise<void> {
    const hasRoleOtherThanIndividualChanged = events.some(
      (event) =>
        !isWorkspaceMemberIndividualRole(
          findEventEntity(event as MetadataEvent<'role'>),
        ),
    );

    if (hasRoleOtherThanIndividualChanged) {
      await this.channelVisibilityRuleSyncSchedulerService.scheduleSyncIfEnabled(
        workspaceId,
      );
    }
  }

  @OnEvent('metadata.roleTarget.*')
  async handleRoleTargetChanged({
    workspaceId,
    events,
  }: MetadataEventBatch<'roleTarget'>): Promise<void> {
    const { flatRoleMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatRoleMaps'],
    );

    const hasAssignmentOtherThanIndividualChanged = events.some((event) => {
      const flatRole = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: findEventEntity(event as MetadataEvent<'roleTarget'>)
          .roleId,
        flatEntityMaps: flatRoleMaps,
      });

      return isDefined(flatRole) && !isWorkspaceMemberIndividualRole(flatRole);
    });

    if (hasAssignmentOtherThanIndividualChanged) {
      await this.channelVisibilityRuleSyncSchedulerService.scheduleSyncIfEnabled(
        workspaceId,
      );
    }
  }
}
