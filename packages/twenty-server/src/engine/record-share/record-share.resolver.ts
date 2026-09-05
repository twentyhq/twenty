import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { RecordSharesDTO } from 'src/engine/record-share/dtos/record-share.dto';
import { ShareWithInput } from 'src/engine/record-share/dtos/share-with.input';
import { ManualRecordShareService } from 'src/engine/record-share/services/manual-record-share.service';

const getUserAuthContextOrThrow = (): UserWorkspaceAuthContext => {
  const authContext = getWorkspaceAuthContext();

  if (!isUserAuthContext(authContext)) {
    throw new PermissionsException(
      PermissionsExceptionMessage.NO_AUTHENTICATION_CONTEXT,
      PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
    );
  }

  return authContext;
};

@MetadataResolver(() => RecordSharesDTO)
@UsePipes(ResolverValidationPipe)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  FeatureFlagGuard,
  CustomPermissionGuard,
)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class RecordShareResolver {
  constructor(
    private readonly manualRecordShareService: ManualRecordShareService,
  ) {}

  @Query(() => RecordSharesDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_RECORD_SHARING_ENABLED)
  async recordShares(
    @Args('objectMetadataId', { type: () => UUIDScalarType })
    objectMetadataId: string,
    @Args('recordId', { type: () => UUIDScalarType }) recordId: string,
  ): Promise<RecordSharesDTO> {
    return this.manualRecordShareService.findRecordShares({
      authContext: getUserAuthContextOrThrow(),
      objectMetadataId,
      recordId,
    });
  }

  @Mutation(() => RecordSharesDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_RECORD_SHARING_ENABLED)
  async shareRecord(
    @Args('objectMetadataId', { type: () => UUIDScalarType })
    objectMetadataId: string,
    @Args('recordId', { type: () => UUIDScalarType }) recordId: string,
    @Args('shareWith', { type: () => [ShareWithInput] })
    shareWith: ShareWithInput[],
  ): Promise<RecordSharesDTO> {
    return this.manualRecordShareService.shareRecord({
      authContext: getUserAuthContextOrThrow(),
      objectMetadataId,
      recordId,
      shareWith,
    });
  }

  @Mutation(() => RecordSharesDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_RECORD_SHARING_ENABLED)
  async unshareRecord(
    @Args('objectMetadataId', { type: () => UUIDScalarType })
    objectMetadataId: string,
    @Args('recordId', { type: () => UUIDScalarType }) recordId: string,
    @Args('principalId', { type: () => UUIDScalarType }) principalId: string,
  ): Promise<RecordSharesDTO> {
    return this.manualRecordShareService.unshareRecord({
      authContext: getUserAuthContextOrThrow(),
      objectMetadataId,
      recordId,
      principalId,
    });
  }

  @Mutation(() => RecordSharesDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_RECORD_SHARING_ENABLED)
  async transferRecordOwnership(
    @Args('objectMetadataId', { type: () => UUIDScalarType })
    objectMetadataId: string,
    @Args('recordId', { type: () => UUIDScalarType }) recordId: string,
    @Args('workspaceMemberId', { type: () => UUIDScalarType })
    workspaceMemberId: string,
  ): Promise<RecordSharesDTO> {
    return this.manualRecordShareService.transferRecordOwnership({
      authContext: getUserAuthContextOrThrow(),
      objectMetadataId,
      recordId,
      workspaceMemberId,
    });
  }
}
