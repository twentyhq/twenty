/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import {
  type FeatureFlagKey,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/permissions/record-share/record-share.exception';
import { canRecordShareGrantOperation } from 'src/engine/permissions/internal/record-share/utils/can-record-share-grant-operation.util';
import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';
import { resolveRecordSharePrincipalRoleIds } from 'src/engine/permissions/internal/record-share/utils/resolve-record-share-principal-role-ids.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type RecordSharePrincipal = Pick<
  RecordShareInput,
  'principalId' | 'principalType'
>;

@Injectable()
export class RecordSharePrincipalService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordPermissionsReadService: RecordPermissionsReadService,
    private readonly principalPermissionsReadService: PrincipalPermissionsReadService,
  ) {}

  async assertShareRecipientsCanReadRecordsOrThrow({
    workspaceId,
    transactionScope,
    flatObjectMetadata,
    featureFlagsMap,
    principals,
    recordIds,
  }: {
    workspaceId: string;
    transactionScope: RecordPermissionTransactionScope;
    flatObjectMetadata: FlatObjectMetadata;
    featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
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
      canRecordShareGrantOperation({
        flatObjectMetadata,
        featureFlagsMap,
        operationType: 'read',
      })
    ) {
      return;
    }

    const { flatWorkspaceMemberMaps, userWorkspaceRoleMap, rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
        'userWorkspaceRoleMap',
        'rolesPermissions',
      ]);
    const roleIds = resolveRecordSharePrincipalRoleIds({
      principals: namedPrincipals,
      flatWorkspaceMemberMaps,
      userWorkspaceRoleMap,
    });
    const roleIdsUnableToReadObject =
      await this.recordPermissionsReadService.filterRoleIdsWithoutReadAccess({
        workspaceId,
        roleIds: roleIds.filter(isDefined),
        objectMetadataId: flatObjectMetadata.id,
      });

    for (const [index, principal] of namedPrincipals.entries()) {
      const roleId = roleIds[index];

      if (!isDefined(roleId) || !isDefined(rolesPermissions[roleId])) {
        continue;
      }

      if (roleIdsUnableToReadObject.has(roleId)) {
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

      const canRecipientReadRecords =
        await this.recordPermissionsReadService.canAccessRecords({
          operationType: 'read',
          principals:
            await this.principalPermissionsReadService.resolvePermissionsPrincipals(
              {
                authContext: {
                  type: 'user',
                  workspace: { id: workspaceId },
                  workspaceMemberId: principal.principalId,
                },
              },
            ),
          objectMetadataId: flatObjectMetadata.id,
          recordIds,
          transactionScope,
        });

      if (!canRecipientReadRecords) {
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
