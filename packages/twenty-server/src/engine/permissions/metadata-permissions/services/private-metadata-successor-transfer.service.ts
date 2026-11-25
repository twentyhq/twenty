import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined, typedObjectEntries } from 'twenty-shared/utils';
import { DataSource, In } from 'typeorm';

import { UserWorkspaceSuccessorService } from 'src/engine/core-modules/user-workspace/services/user-workspace-successor.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ALL_METADATA_ENTITY_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-entity-by-metadata-name.constant';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { PRIVATABLE_METADATA_NAMES } from 'src/engine/permissions/metadata-permissions/constants/privatable-metadata-names.constant';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class PrivateMetadataSuccessorTransferService {
  constructor(
    private readonly userWorkspaceSuccessorService: UserWorkspaceSuccessorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async transferPrivateMetadataToSuccessor({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    actingUserWorkspaceId?: string;
  }): Promise<void> {
    const { workspaceId } = removedUserWorkspace;

    const privatableMetadataNames = typedObjectEntries(
      PRIVATABLE_METADATA_NAMES,
    ).map(([metadataName]) => metadataName);

    const privatableFlatEntityMaps =
      await this.workspaceCacheService.getOrRecompute(
        workspaceId,
        privatableMetadataNames.map(getMetadataFlatEntityMapsKey),
      );

    const privateEntityIdsByMetadataName = privatableMetadataNames
      .map((metadataName) => ({
        metadataName,
        privateEntityIds: Object.values(
          privatableFlatEntityMaps[getMetadataFlatEntityMapsKey(metadataName)]
            .byUniversalIdentifier,
        )
          .filter(isDefined)
          .filter(
            (flatEntity) =>
              flatEntity.createdByUserWorkspaceId === removedUserWorkspace.id &&
              resolveEffectiveFlatEntity({ metadataName, flatEntity })
                .isPrivate,
          )
          .map((flatEntity) => flatEntity.id),
      }))
      .filter(({ privateEntityIds }) => isNonEmptyArray(privateEntityIds));

    if (!isNonEmptyArray(privateEntityIdsByMetadataName)) {
      return;
    }

    const successorUserWorkspace =
      await this.userWorkspaceSuccessorService.findSuccessorUserWorkspace({
        removedUserWorkspace,
        actingUserWorkspaceId,
      });

    if (!isDefined(successorUserWorkspace)) {
      return;
    }

    await this.coreDataSource.transaction(async (transactionManager) => {
      for (const {
        metadataName,
        privateEntityIds,
      } of privateEntityIdsByMetadataName) {
        await new WorkspaceScopedRepository(
          transactionManager.getRepository(
            ALL_METADATA_ENTITY_BY_METADATA_NAME[metadataName],
          ),
        ).update(
          workspaceId,
          {
            id: In(privateEntityIds),
            createdByUserWorkspaceId: removedUserWorkspace.id,
          },
          { createdByUserWorkspaceId: successorUserWorkspace.id },
        );
      }
    });

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      privateEntityIdsByMetadataName.map(({ metadataName }) =>
        getMetadataFlatEntityMapsKey(metadataName),
      ),
    );
  }
}
