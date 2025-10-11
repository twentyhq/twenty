import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateDatabaseEventTriggerInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/create-database-event-trigger.input';
import { DatabaseEventTriggerIdInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/database-event-trigger-id.input';
import { DatabaseEventTriggerDTO } from 'src/engine/metadata-modules/database-event-trigger/dtos/database-event-trigger.dto';
import { UpdateDatabaseEventTriggerInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/update-database-event-trigger.input';
import { DatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { DatabaseEventTriggerV2Service } from 'src/engine/metadata-modules/database-event-trigger/services/database-event-trigger-v2.service';
import { databaseEventTriggerGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/database-event-trigger/utils/database-event-trigger-graphql-api-exception-handler.utils';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class DatabaseEventTriggerResolver {
  constructor(
    private readonly databaseEventTriggerV2Service: DatabaseEventTriggerV2Service,
    @InjectRepository(DatabaseEventTrigger)
    private readonly databaseEventTriggerRepository: Repository<DatabaseEventTrigger>,
  ) {}

  @Query(() => DatabaseEventTriggerDTO)
  async findOneDatabaseEventTrigger(
    @Args('input') { id }: DatabaseEventTriggerIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.databaseEventTriggerRepository.findOneOrFail({
        where: {
          id,
          workspaceId,
        },
      });
    } catch (error) {
      databaseEventTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [DatabaseEventTriggerDTO])
  async findManyDatabaseEventTriggers(
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.databaseEventTriggerRepository.find({
        where: { workspaceId },
      });
    } catch (error) {
      databaseEventTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => DatabaseEventTriggerDTO)
  async deleteOneDatabaseEventTrigger(
    @Args('input') input: DatabaseEventTriggerIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.databaseEventTriggerV2Service.destroyOne({
        destroyDatabaseEventTriggerInput: input,
        workspaceId,
      });
    } catch (error) {
      databaseEventTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => DatabaseEventTriggerDTO)
  async updateOneDatabaseEventTrigger(
    @Args('input')
    input: UpdateDatabaseEventTriggerInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.databaseEventTriggerV2Service.updateOne(
        input,
        workspaceId,
      );
    } catch (error) {
      databaseEventTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => DatabaseEventTriggerDTO)
  async createOneDatabaseEventTrigger(
    @Args('input')
    input: CreateDatabaseEventTriggerInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.databaseEventTriggerV2Service.createOne(
        input,
        workspaceId,
      );
    } catch (error) {
      databaseEventTriggerGraphQLApiExceptionHandler(error);
    }
  }
}
