/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { PermissionsMetadataMapsService } from 'src/engine/permissions/combine/services/permissions-metadata-maps.service';
import { PermissionsService } from 'src/engine/permissions/permissions.service';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/principal/utils/build-role-permissions-principals.util';
import { isRolePermittingOperation } from 'src/engine/permissions/role/utils/is-role-permitting-operation.util';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/permissions/record-share/record-share.exception';
import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type RecordSharePrincipal = Pick<
  RecordShareInput,
  'principalId' | 'principalType'
>;

@Injectable()
export class RecordSharePrincipalService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly permissionsMetadataMapsService: PermissionsMetadataMapsService,
    private readonly permissionsService: PermissionsService,
  ) {}

  // Undefined for everyone, and for a member who left or whose membership is gone
  async resolveRoleIds({
    workspaceId,
    principals,
  }: {
    workspaceId: string;
    principals: RecordSharePrincipal[];
  }): Promise<(string | undefined)[]> {
    const { flatWorkspaceMemberMaps, userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
        'userWorkspaceRoleMap',
      ]);

    return principals.map((principal) => {
      switch (principal.principalType) {
        case RecordSharePrincipalType.ROLE:
          return principal.principalId;
        case RecordSharePrincipalType.WORKSPACE_MEMBER: {
          const flatWorkspaceMember =
            flatWorkspaceMemberMaps.byId[principal.principalId];

          if (
            !isDefined(flatWorkspaceMember) ||
            isDefined(flatWorkspaceMember.deletedAt)
          ) {
            return undefined;
          }

          const userWorkspaceId =
            flatWorkspaceMemberMaps.userWorkspaceIdByUserId[
              flatWorkspaceMember.userId
            ];

          return isDefined(userWorkspaceId)
            ? userWorkspaceRoleMap[userWorkspaceId]
            : undefined;
        }
        default:
          return undefined;
      }
    });
  }

  // Without reach beyond roles, a grant the recipient's role cannot use would
  // be stored without ever taking effect. Runs after the grants are written:
  // they satisfy the share gate, so only the role and its row filter are tested
  async assertPrincipalsReachRecordsOrThrow({
    workspaceId,
    transactionScope,
    flatObjectMetadata,
    canShareBeyondRole,
    principals,
    recordIds,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    flatObjectMetadata: FlatObjectMetadata;
    canShareBeyondRole: boolean;
    principals: RecordSharePrincipal[];
    recordIds: string[];
  }): Promise<void> {
    const namedPrincipals = principals.filter(
      (principal) =>
        principal.principalType !== RecordSharePrincipalType.EVERYONE,
    );

    if (
      namedPrincipals.length === 0 ||
      recordIds.length === 0 ||
      canShareBeyondRole
    ) {
      return;
    }

    const roleIds = await this.resolveRoleIds({
      workspaceId,
      principals: namedPrincipals,
    });
    const metadataMaps = await this.permissionsMetadataMapsService.load({
      workspaceId,
    });

    for (const [index, principal] of namedPrincipals.entries()) {
      const roleId = roleIds[index];

      if (
        !isDefined(roleId) ||
        !isDefined(metadataMaps.rolesPermissions[roleId])
      ) {
        continue;
      }

      const rolePrincipals = buildRolePermissionsPrincipals({
        workspaceId,
        roleId,
      });

      if (
        !isRolePermittingOperation({
          principals: rolePrincipals,
          metadataMaps,
          flatObjectMetadata,
          operationType: 'select',
        })
      ) {
        throw new RecordShareException(
          `Principal ${principal.principalId} cannot access ${flatObjectMetadata.nameSingular} records through its role`,
          RecordShareExceptionCode.INVALID_SHARE_WITH,
          {
            userFriendlyMessage: msg`Their role cannot access these records, and this object is only shared with roles that can.`,
          },
        );
      }

      // A role's row filter can depend on which member reads, so a share with
      // a role is only held to object access here and filtered per member on read
      if (principal.principalType === RecordSharePrincipalType.ROLE) {
        continue;
      }

      const hasGrant = await this.permissionsService.canReadRecords({
        principals: await this.permissionsService.buildPermissionsPrincipals({
          authContext: {
            type: 'user',
            workspace: { id: workspaceId },
            workspaceMemberId: principal.principalId,
          },
        }),
        objectMetadataId: flatObjectMetadata.id,
        recordIds,
        transactionScope,
      });

      if (!hasGrant) {
        throw new RecordShareException(
          `Principal ${principal.principalId} cannot see these records through its role`,
          RecordShareExceptionCode.INVALID_SHARE_WITH,
          {
            userFriendlyMessage: msg`Their role cannot see this record, and this object is only shared with people who can.`,
          },
        );
      }
    }
  }
}
