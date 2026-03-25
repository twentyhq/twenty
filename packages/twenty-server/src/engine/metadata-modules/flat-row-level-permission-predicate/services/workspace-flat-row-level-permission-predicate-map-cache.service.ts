/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromRowLevelPermissionPredicateEntityToFlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-row-level-permission-predicate-entity-to-flat-row-level-permission-predicate.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRowLevelPermissionPredicateMaps')
export class WorkspaceFlatRowLevelPermissionPredicateMapCacheService extends WorkspaceCacheProvider<FlatRowLevelPermissionPredicateMaps> {
  constructor(
    @InjectRepository(RowLevelPermissionPredicateEntity)
    private readonly rowLevelPermissionPredicateRepository: Repository<RowLevelPermissionPredicateEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RowLevelPermissionPredicateGroupEntity)
    private readonly rowLevelPermissionPredicateGroupRepository: Repository<RowLevelPermissionPredicateGroupEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatRowLevelPermissionPredicateMaps> {
    const [
      rowLevelPermissionPredicates,
      applications,
      fieldMetadatas,
      objectMetadatas,
      roles,
      rowLevelPermissionPredicateGroups,
    ] = await Promise.all([
      this.rowLevelPermissionPredicateRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      this.applicationRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.fieldMetadataRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.objectMetadataRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.roleRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.rowLevelPermissionPredicateGroupRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(rowLevelPermissionPredicateGroups);

    const flatRowLevelPermissionPredicateMaps = createEmptyFlatEntityMaps();

    for (const rowLevelPermissionPredicateEntity of rowLevelPermissionPredicates) {
      const flatRowLevelPermissionPredicate =
        fromRowLevelPermissionPredicateEntityToFlatRowLevelPermissionPredicate({
          entity: rowLevelPermissionPredicateEntity,
          applicationIdToUniversalIdentifierMap,
          fieldMetadataIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
          roleIdToUniversalIdentifierMap,
          rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRowLevelPermissionPredicate,
        flatEntityMapsToMutate: flatRowLevelPermissionPredicateMaps,
      });
    }

    return flatRowLevelPermissionPredicateMaps;
  }
}
