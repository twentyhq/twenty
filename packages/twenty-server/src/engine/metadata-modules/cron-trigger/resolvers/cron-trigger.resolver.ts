import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { PermissionFlagType } from 'twenty-shared/constants';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateCronTriggerInput } from 'src/engine/metadata-modules/cron-trigger/dtos/create-cron-trigger.input';
import { CronTriggerIdInput } from 'src/engine/metadata-modules/cron-trigger/dtos/cron-trigger-id.input';
import { CronTriggerDTO } from 'src/engine/metadata-modules/cron-trigger/dtos/cron-trigger.dto';
import { UpdateCronTriggerInput } from 'src/engine/metadata-modules/cron-trigger/dtos/update-cron-trigger.input';
import { CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { CronTriggerV2Service } from 'src/engine/metadata-modules/cron-trigger/services/cron-trigger-v2.service';
import { cronTriggerGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/cron-trigger/utils/cron-trigger-graphql-api-exception-handler.util';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class CronTriggerResolver {
  constructor(
    private readonly cronTriggerV2Service: CronTriggerV2Service,
    @InjectRepository(CronTriggerEntity)
    private readonly cronTriggerRepository: Repository<CronTriggerEntity>,
  ) {}

  @Query(() => CronTriggerDTO)
  async findOneCronTrigger(
    @Args('input') { id }: CronTriggerIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.cronTriggerRepository.findOneOrFail({
        where: {
          id,
          workspaceId,
        },
      });
    } catch (error) {
      cronTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [CronTriggerDTO])
  async findManyCronTriggers(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.cronTriggerRepository.find({
        where: { workspaceId },
      });
    } catch (error) {
      cronTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => CronTriggerDTO)
  async deleteOneCronTrigger(
    @Args('input') input: CronTriggerIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.cronTriggerV2Service.destroyOne({
        destroyCronTriggerInput: input,
        workspaceId,
      });
    } catch (error) {
      cronTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => CronTriggerDTO)
  async updateOneCronTrigger(
    @Args('input')
    input: UpdateCronTriggerInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.cronTriggerV2Service.updateOne(input, workspaceId);
    } catch (error) {
      cronTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => CronTriggerDTO)
  async createOneCronTrigger(
    @Args('input')
    input: CreateCronTriggerInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      return await this.cronTriggerV2Service.createOne(input, workspaceId);
    } catch (error) {
      cronTriggerGraphQLApiExceptionHandler(error);
    }
  }
}
