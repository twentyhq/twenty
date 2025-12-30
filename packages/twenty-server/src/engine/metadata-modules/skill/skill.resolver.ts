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
import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { SkillGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/skill/interceptors/skill-graphql-api-exception.interceptor';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

const fromSkillEntityToSkillDTO = (skillEntity: SkillEntity): SkillDTO => ({
  id: skillEntity.id,
  standardId: skillEntity.standardId,
  name: skillEntity.name,
  label: skillEntity.label,
  icon: skillEntity.icon ?? undefined,
  description: skillEntity.description ?? undefined,
  content: skillEntity.content,
  isCustom: skillEntity.isCustom,
  workspaceId: skillEntity.workspaceId,
  applicationId: skillEntity.applicationId ?? undefined,
  createdAt: skillEntity.createdAt,
  updatedAt: skillEntity.updatedAt,
});

@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.AI))
@UseInterceptors(SkillGraphqlApiExceptionInterceptor)
@Resolver(() => SkillDTO)
export class SkillResolver {
  constructor(private readonly skillService: SkillService) {}

  @Query(() => [SkillDTO])
  async skills(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO[]> {
    const skills = await this.skillService.findAll(workspace.id);

    return skills.map(fromSkillEntityToSkillDTO);
  }

  @Query(() => SkillDTO, { nullable: true })
  async skill(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO | null> {
    const skill = await this.skillService.findById(id, workspace.id);

    return skill ? fromSkillEntityToSkillDTO(skill) : null;
  }

  @Mutation(() => SkillDTO)
  async createSkill(
    @Args('input') input: CreateSkillInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO> {
    const skill = await this.skillService.create(input, workspace.id);

    return fromSkillEntityToSkillDTO(skill);
  }

  @Mutation(() => SkillDTO)
  async updateSkill(
    @Args('input') input: UpdateSkillInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO> {
    const skill = await this.skillService.update(input, workspace.id);

    return fromSkillEntityToSkillDTO(skill);
  }

  @Mutation(() => Boolean)
  async deleteSkill(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.skillService.delete(id, workspace.id);

    return true;
  }
}
