import { UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ResetTimelineActivityRuleInput } from 'src/engine/metadata-modules/timeline-activity-rule/dtos/reset-timeline-activity-rule.input';
import { TimelineActivityRuleDTO } from 'src/engine/metadata-modules/timeline-activity-rule/dtos/timeline-activity-rule.dto';
import { UpsertTimelineActivityRuleInput } from 'src/engine/metadata-modules/timeline-activity-rule/dtos/upsert-timeline-activity-rule.input';
import { TimelineActivityRuleGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/timeline-activity-rule/interceptors/timeline-activity-rule-graphql-api-exception.interceptor';
import { TimelineActivityRuleService } from 'src/engine/metadata-modules/timeline-activity-rule/services/timeline-activity-rule.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  TimelineActivityRuleGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => TimelineActivityRuleDTO)
export class TimelineActivityRuleResolver {
  constructor(
    private readonly timelineActivityRuleService: TimelineActivityRuleService,
  ) {}

  @Query(() => [TimelineActivityRuleDTO])
  @UseGuards(NoPermissionGuard)
  async timelineActivityRules(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TimelineActivityRuleDTO[]> {
    return await this.timelineActivityRuleService.findEffectiveRules(
      workspace.id,
    );
  }

  @Mutation(() => TimelineActivityRuleDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  async upsertTimelineActivityRule(
    @Args('input') input: UpsertTimelineActivityRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TimelineActivityRuleDTO> {
    return await this.timelineActivityRuleService.upsert(input, workspace.id);
  }

  @Mutation(() => TimelineActivityRuleDTO, { nullable: true })
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  async resetTimelineActivityRule(
    @Args('input') input: ResetTimelineActivityRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TimelineActivityRuleDTO | null> {
    return await this.timelineActivityRuleService.reset(input, workspace.id);
  }
}
