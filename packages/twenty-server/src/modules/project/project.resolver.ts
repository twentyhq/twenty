import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ProjectService } from './project.service';

// --- DTOs ---
@ObjectType()
class ProjectDTO {
  @Field() id: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) dealId?: string;
  @Field(() => Float, { nullable: true }) progressPercent?: number;
}

@ObjectType()
class ProjectTaskDTO {
  @Field() id: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) phase?: string;
  @Field(() => Float, { nullable: true }) estimatedHours?: number;
}

@ObjectType()
class TimeEntryDTO {
  @Field() id: string;
  @Field() projectId: string;
  @Field() userId: string;
  @Field(() => Float) hours: number;
  @Field({ nullable: true }) isBillable?: boolean;
}

@ObjectType()
class ProjectRiskDTO {
  @Field() id: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) impact?: string;
  @Field({ nullable: true }) probability?: string;
}

@ObjectType()
class GanttItemDTO {
  @Field() id: string;
  @Field() name: string;
  @Field({ nullable: true }) start?: string;
  @Field({ nullable: true }) end?: string;
  @Field(() => Int) progress: number;
  @Field(() => [String]) dependencies: string[];
}

@ObjectType()
class ProjectPLDTO {
  @Field(() => Float) revenue: number;
  @Field(() => Float) cost: number;
  @Field(() => Float) margin: number;
  @Field(() => Float) marginPercent: number;
}

@ObjectType()
class ProjectHealthDTO {
  @Field(() => Int) score: number;
  @Field() color: string;
}

@InputType()
class CreateTaskInput {
  @Field() name: string;
  @Field({ nullable: true }) phase?: string;
  @Field({ nullable: true }) assigneeId?: string;
  @Field(() => Float, { nullable: true }) estimatedHours?: number;
  @Field({ nullable: true }) dueDate?: Date;
}

@InputType()
class LogTimeInput {
  @Field({ nullable: true }) taskId?: string;
  @Field() userId: string;
  @Field(() => Float) hours: number;
  @Field() date: Date;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) isBillable?: boolean;
  @Field(() => Float, { nullable: true }) hourlyRate?: number;
}

@InputType()
class AddRiskInput {
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) impact?: string;
  @Field({ nullable: true }) probability?: string;
  @Field({ nullable: true }) mitigationPlan?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class ProjectResolver {
  constructor(private readonly service: ProjectService) {}

  @Mutation(() => ProjectDTO)
  async createProjectFromDeal(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('dealId') dealId: string,
    @Args('name') name: string,
    @Args('templateId', { nullable: true }) templateId?: string,
  ) {
    return this.service.createFromDeal(workspace.id, dealId, name, templateId);
  }

  @Mutation(() => ProjectTaskDTO)
  async createTask(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('projectId') projectId: string,
    @Args('input') input: CreateTaskInput,
  ) {
    return this.service.createTask(projectId, input);
  }

  @Mutation(() => ProjectTaskDTO)
  async completeTask(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('taskId') taskId: string,
  ) {
    return this.service.completeTask(taskId);
  }

  @Mutation(() => TimeEntryDTO)
  async logTime(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('projectId') projectId: string,
    @Args('input') input: LogTimeInput,
  ) {
    return this.service.logTime(projectId, input);
  }

  @Mutation(() => ProjectRiskDTO)
  async addRisk(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('projectId') projectId: string,
    @Args('input') input: AddRiskInput,
  ) {
    return this.service.addRisk(projectId, input);
  }

  @Query(() => [GanttItemDTO])
  async getGanttData(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('projectId') projectId: string,
  ) {
    return this.service.getGanttData(projectId);
  }

  @Query(() => ProjectPLDTO)
  async getPLByProject(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('projectId') projectId: string,
  ) {
    return this.service.getPLByProject(projectId);
  }

  @Query(() => ProjectHealthDTO)
  async calculateProjectHealthScore(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('projectId') projectId: string,
  ) {
    return this.service.calculateHealthScore(projectId);
  }
}
