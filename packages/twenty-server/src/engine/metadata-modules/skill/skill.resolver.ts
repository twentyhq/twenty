import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateSkillInput } from 'src/engine/metadata-modules/skill/dtos/create-skill.input';
import { SkillDTO } from 'src/engine/metadata-modules/skill/dtos/skill.dto';
import { UpdateSkillInput } from 'src/engine/metadata-modules/skill/dtos/update-skill.input';
import { SkillGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/skill/interceptors/skill-graphql-api-exception.interceptor';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.AI))
@UseInterceptors(
  WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor,
  SkillGraphqlApiExceptionInterceptor,
)
@Resolver(() => SkillDTO)
export class SkillResolver {
  constructor(private readonly skillService: SkillService) {}

  @Query(() => [SkillDTO])
  async skills(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO[]> {
    return this.skillService.findAll(workspace.id);
  }

  @Query(() => SkillDTO, { nullable: true })
  async skill(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO | null> {
    return this.skillService.findById(id, workspace.id);
  }

  @Mutation(() => SkillDTO)
  async createSkill(
    @Args('input') input: CreateSkillInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO> {
    return this.skillService.create(input, workspace.id);
  }

  @Mutation(() => SkillDTO)
  async updateSkill(
    @Args('input') input: UpdateSkillInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO> {
    return this.skillService.update(input, workspace.id);
  }

  @Mutation(() => SkillDTO)
  async deleteSkill(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO> {
    return this.skillService.delete(id, workspace.id);
  }

  @Mutation(() => SkillDTO)
  async activateSkill(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO> {
    return this.skillService.activate(id, workspace.id);
  }

  @Mutation(() => SkillDTO)
  async deactivateSkill(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO> {
    return this.skillService.deactivate(id, workspace.id);
  }
}
