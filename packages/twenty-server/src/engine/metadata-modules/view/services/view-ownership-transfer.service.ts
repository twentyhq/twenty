import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { UserWorkspaceSuccessorService } from 'src/engine/core-modules/user-workspace/services/user-workspace-successor.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { getEffectiveViewIsPrivate } from 'src/engine/metadata-modules/view/utils/get-effective-view-is-private.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ViewOwnershipTransferService {
  constructor(
    private readonly userWorkspaceSuccessorService: UserWorkspaceSuccessorService,
    @InjectWorkspaceScopedRepository(ViewEntity)
    private readonly viewRepository: WorkspaceScopedRepository<ViewEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async transferViewsOwnershipToSuccessor({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    actingUserWorkspaceId?: string;
  }): Promise<void> {
    const { workspaceId } = removedUserWorkspace;

    const { flatViewMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatViewMaps'],
    );

    const viewsOfRemovedMember = Object.values(
      flatViewMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatView) =>
          flatView.createdByUserWorkspaceId === removedUserWorkspace.id,
      );

    if (!isNonEmptyArray(viewsOfRemovedMember)) {
      return;
    }

    const privateViewIds = viewsOfRemovedMember
      .filter((flatView) => getEffectiveViewIsPrivate(flatView) !== false)
      .map((flatView) => flatView.id);

    const successorUserWorkspace = isNonEmptyArray(privateViewIds)
      ? await this.userWorkspaceSuccessorService.findSuccessorUserWorkspace({
          removedUserWorkspace,
          actingUserWorkspaceId,
        })
      : undefined;

    if (isDefined(successorUserWorkspace)) {
      await this.viewRepository.update(
        workspaceId,
        {
          id: In(privateViewIds),
          createdByUserWorkspaceId: removedUserWorkspace.id,
        },
        { createdByUserWorkspaceId: successorUserWorkspace.id },
      );
    }

    await this.viewRepository.update(
      workspaceId,
      { createdByUserWorkspaceId: removedUserWorkspace.id },
      { createdByUserWorkspaceId: null },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatViewMaps',
    ]);
  }
}
