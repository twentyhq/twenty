import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { EnsoRoutingAvailabilityDTO } from 'src/modules/enso/routing-availability/dtos/enso-routing-availability.dto';
import { RoutingAvailabilitySelfService } from 'src/modules/enso/routing-availability/services/routing-availability-self.service';

// Being a signed-in member is enough (NoPermissionGuard): the member whose
// presence flips is resolved from the auth context and never taken from the
// client, so this can only ever act on the caller's own row.
@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
export class RoutingAvailabilityResolver {
  constructor(
    private readonly routingAvailabilitySelfService: RoutingAvailabilitySelfService,
  ) {}

  @Mutation(() => EnsoRoutingAvailabilityDTO)
  async ensoSetMyRoutingAvailability(
    @Args('isAvailableForRouting', { type: () => Boolean })
    isAvailableForRouting: boolean,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
  ): Promise<EnsoRoutingAvailabilityDTO> {
    const result = await this.routingAvailabilitySelfService.setOwnAvailability({
      workspaceId: workspace.id,
      workspaceMemberId,
      isAvailableForRouting,
    });

    return { isAvailableForRouting: result };
  }
}
