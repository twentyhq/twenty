import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPermissionFlagDefinitionMaps } from 'src/engine/metadata-modules/flat-permission-flag-definition/types/flat-permission-flag-definition-maps.type';
import { fromPermissionFlagDefinitionEntityToFlatPermissionFlagDefinition } from 'src/engine/metadata-modules/flat-permission-flag-definition/utils/from-permission-flag-definition-entity-to-flat-permission-flag-definition.util';
import { PermissionFlagDefinitionEntity } from 'src/engine/metadata-modules/permission-flag-definition/entities/permission-flag-definition.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPermissionFlagDefinitionMaps')
export class WorkspaceFlatPermissionFlagDefinitionMapCacheService extends WorkspaceCacheProvider<FlatPermissionFlagDefinitionMaps> {
  constructor(
    @InjectRepository(PermissionFlagDefinitionEntity)
    private readonly permissionFlagDefinitionRepository: Repository<PermissionFlagDefinitionEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatPermissionFlagDefinitionMaps> {
    const [permissionFlagDefinitions, applications] = await Promise.all([
      this.permissionFlagDefinitionRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      this.applicationRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatPermissionFlagDefinitionMaps = createEmptyFlatEntityMaps();

    for (const definition of permissionFlagDefinitions) {
      const flatDefinition =
        fromPermissionFlagDefinitionEntityToFlatPermissionFlagDefinition({
          entity: definition,
          applicationIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatDefinition,
        flatEntityMapsToMutate: flatPermissionFlagDefinitionMaps,
      });
    }

    return flatPermissionFlagDefinitionMaps;
  }
}
