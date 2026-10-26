import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { RecordPermissionPolicyService } from 'src/engine/core-modules/record-permission/services/record-permission-policy.service';
import { RecordPermissionDispatcherService } from 'src/engine/core-modules/record-permission/services/record-permission-dispatcher.service';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';

@MetadataResolver()
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: { withUser: true, withoutUser: false },
    application: { withUser: true, withoutUser: false },
  }),
  SettingsPermissionGuard(PermissionFlagType.ROLES),
)
export class RecordPermissionPolicyResolver {
  constructor(
    private readonly policy: RecordPermissionPolicyService,
    private readonly dispatcher: RecordPermissionDispatcherService,
  ) {}

  @Query(() => GraphQLJSON)
  recordPermissionPolicy() {
    return this.policy.getState(getWorkspaceAuthContext().workspace.id);
  }

  @Mutation(() => GraphQLJSON)
  async publishRecordPermissionPolicy(
    @Args('definition', { type: () => GraphQLJSON }) definition: unknown,
    @Args('expectedActiveRevisionId', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    expectedActiveRevisionId: string | null,
  ) {
    const workspaceId = getWorkspaceAuthContext().workspace.id;
    const state = await this.policy.createCandidate(
      workspaceId,
      definition,
      expectedActiveRevisionId,
    );

    await this.dispatcher.enqueue(workspaceId);

    return state;
  }

  @Mutation(() => GraphQLJSON)
  cancelRecordPermissionPolicy(
    @Args('revisionId', { type: () => UUIDScalarType }) revisionId: string,
  ) {
    return this.policy.cancelCandidate(
      getWorkspaceAuthContext().workspace.id,
      revisionId,
    );
  }
}
