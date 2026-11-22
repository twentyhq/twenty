import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { AuthenticationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RecordSharePrincipalInput,
  RecordSharingDTO,
} from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { RecordSharingDelegateRegistryService } from 'src/engine/permissions/record-share/services/record-sharing-delegate-registry.service';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';
import { RecordShareException } from 'src/engine/permissions/record-share/record-share.exception';
import { RecordSharingPermissionsService } from 'src/engine/permissions/record-sharing-permissions.service';
import { RecordSharingWriteService } from 'src/engine/permissions/record-share/services/record-sharing-write.service';
import { recordShareGraphqlApiExceptionHandler } from 'src/engine/permissions/record-share/utils/record-share-graphql-api-exception-handler.util';
import { RecordTargetInput } from 'src/engine/permissions/record-permissions/dtos/record-target.input';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@MetadataResolver()
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: { withUser: true, withoutUser: false },
      application: { withUser: true, withoutUser: false },
    },
    requiredPermissionFlags: [],
  }),
  CustomPermissionGuard,
)
export class RecordSharingResolver {
  constructor(
    private readonly recordSharingWriteService: RecordSharingWriteService,
    private readonly recordSharingPermissionsService: RecordSharingPermissionsService,
    private readonly recordSharingDelegateRegistryService: RecordSharingDelegateRegistryService,
  ) {}

  @Query(() => RecordSharingDTO)
  async recordSharing(@Args('target') target: RecordTargetInput) {
    const args = { ...target, authContext: this.getUserContext() };
    const delegate = await this.findEnabledDelegate(args);

    return isDefined(delegate)
      ? delegate.findRecordSharing(args)
      : this.recordSharingPermissionsService.findRecordSharingPanel(args);
  }

  @Mutation(() => RecordSharingDTO)
  setRecordPrivate(
    @Args('target') target: RecordTargetInput,
    @Args('isPrivate', { type: () => Boolean }) isPrivate: boolean,
  ) {
    return this.handleRecordShareException(() =>
      this.recordSharingWriteService.setRecordPrivacy({
        ...target,
        isPrivate,
        authContext: this.getUserContext(),
      }),
    );
  }

  @Mutation(() => RecordSharingDTO)
  setRecordShare(
    @Args('target') target: RecordTargetInput,
    @Args('principal') principal: RecordSharePrincipalInput,
    @Args('accessLevel', { type: () => RecordShareAccessLevel })
    accessLevel: RecordShareAccessLevel,
  ) {
    const args = {
      ...target,
      principal,
      accessLevel,
      authContext: this.getUserContext(),
    };

    return this.handleRecordShareException(async () => {
      const delegate = await this.findEnabledDelegate(args);

      return isDefined(delegate)
        ? delegate.setShare(args)
        : this.recordSharingWriteService.setShare(args);
    });
  }

  @Mutation(() => RecordSharingDTO)
  removeRecordShare(
    @Args('target') target: RecordTargetInput,
    @Args('principal') principal: RecordSharePrincipalInput,
  ) {
    const args = { ...target, principal, authContext: this.getUserContext() };

    return this.handleRecordShareException(async () => {
      const delegate = await this.findEnabledDelegate(args);

      return isDefined(delegate)
        ? delegate.removeShare(args)
        : this.recordSharingWriteService.removeShare(args);
    });
  }

  private findEnabledDelegate({
    authContext,
    objectMetadataId,
  }: RecordSharingArgs) {
    return this.recordSharingDelegateRegistryService.findEnabledDelegate({
      workspaceId: authContext.workspace.id,
      objectMetadataId,
    });
  }

  private async handleRecordShareException(
    change: () => Promise<RecordSharingDTO>,
  ): Promise<RecordSharingDTO> {
    try {
      return await change();
    } catch (error) {
      if (error instanceof RecordShareException) {
        recordShareGraphqlApiExceptionHandler(error);
      }
      throw error;
    }
  }

  private getUserContext() {
    const authContext = getWorkspaceAuthContext();
    if (!isUserAuthContext(authContext)) {
      throw new AuthenticationError('User authentication required');
    }
    return authContext;
  }
}
