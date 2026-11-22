/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type RowLevelPermissionPredicate } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type WorkspaceMemberRelationValueLookup,
  WorkspaceMemberRelationValueRepository,
} from 'src/engine/permissions/internal/record-permission-repository/repositories/workspace-member-relation-value.repository';
import { type RlsWorkspaceMemberRelationValueMaps } from 'src/engine/permissions/internal/rls/types/rls-workspace-member-relation-value-maps.type';
import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';
import { findRelationJoinColumnsOrThrow } from 'src/engine/permissions/internal/rls/utils/find-relation-join-columns-or-throw.util';
import { findWorkspaceMemberRelationColumnName } from 'src/engine/permissions/internal/rls/utils/find-workspace-member-relation-column-name.util';
import { findWorkspaceMemberRelationPredicates } from 'src/engine/permissions/internal/rls/utils/find-workspace-member-relation-predicates.util';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';

@Injectable()
@WorkspaceCache('rlsWorkspaceMemberRelationValueMaps', {
  localDataOnly: true,
  packingPonderation: 1,
})
export class RlsWorkspaceMemberRelationValueMapsCacheService extends WorkspaceCacheProvider<RlsWorkspaceMemberRelationValueMaps> {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMemberRelationValueRepository: WorkspaceMemberRelationValueRepository,
  ) {
    super();
  }

  async computeForCache({
    workspaceId,
  }: WorkspaceCacheProviderContext): Promise<RlsWorkspaceMemberRelationValueMaps> {
    const {
      rolesPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMapsOrm,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'rolesPermissions',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMapsOrm',
    ]);
    const lookups = findWorkspaceMemberRelationPredicates(rolesPermissions)
      .map((predicate) => ({
        memberFieldKey: buildMemberFieldKey(predicate),
        lookup: this.buildLookup({
          predicate,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
        }),
      }))
      .filter(
        (
          lookupWithKey,
        ): lookupWithKey is {
          memberFieldKey: string;
          lookup: WorkspaceMemberRelationValueLookup;
        } => isDefined(lookupWithKey.lookup),
      );
    const byWorkspaceMemberId: RlsWorkspaceMemberRelationValueMaps['byWorkspaceMemberId'] =
      {};

    for (const {
      lookupIndex,
      workspaceMemberId,
      values,
    } of await this.workspaceMemberRelationValueRepository.findValuesByWorkspaceMemberId(
      { workspaceId, lookups: lookups.map(({ lookup }) => lookup) },
    )) {
      byWorkspaceMemberId[workspaceMemberId] = {
        ...byWorkspaceMemberId[workspaceMemberId],
        [lookups[lookupIndex].memberFieldKey]: values,
      };
    }

    return { byWorkspaceMemberId };
  }

  private buildLookup({
    predicate,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    predicate: Pick<
      RowLevelPermissionPredicate,
      | 'workspaceMemberFieldMetadataId'
      | 'workspaceMemberRelationFieldMetadataId'
    >;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): WorkspaceMemberRelationValueLookup | null {
    const findField = (fieldMetadataId: string | null | undefined) =>
      isDefined(fieldMetadataId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldMetadataId,
            flatEntityMaps: flatFieldMetadataMaps,
          })
        : undefined;
    const relationFieldMetadata = findField(
      predicate.workspaceMemberRelationFieldMetadataId,
    );
    const workspaceMemberFlatObjectMetadata = isDefined(relationFieldMetadata)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: relationFieldMetadata.objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined;
    const relatedFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: relationFieldMetadata?.relationTargetObjectMetadataId ?? '',
      flatEntityMaps: flatObjectMetadataMaps,
    });
    const valueColumnName = findWorkspaceMemberRelationColumnName(
      findField(predicate.workspaceMemberFieldMetadataId),
    );

    if (
      !isDefined(relationFieldMetadata) ||
      !isDefined(workspaceMemberFlatObjectMetadata) ||
      workspaceMemberFlatObjectMetadata.universalIdentifier !==
        STANDARD_OBJECTS.workspaceMember.universalIdentifier ||
      !isDefined(relatedFlatObjectMetadata) ||
      !isDefined(valueColumnName)
    ) {
      return null;
    }

    const { sourceColumnName, targetColumnName } =
      findRelationJoinColumnsOrThrow({
        relationFieldMetadata,
        flatFieldMetadataMaps,
      });

    return {
      workspaceMemberFlatObjectMetadata,
      relatedFlatObjectMetadata,
      workspaceMemberColumnName: sourceColumnName,
      relatedColumnName: targetColumnName,
      valueColumnName,
    };
  }
}
