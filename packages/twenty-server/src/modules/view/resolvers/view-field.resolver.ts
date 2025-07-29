import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { ViewField } from 'src/engine/metadata-modules/view/view-field.entity';
import { UpdateViewFieldInput } from 'src/modules/view/dtos/inputs/update-view-field.input';
import { ViewFieldDTO } from 'src/modules/view/dtos/view-field.dto';

@Resolver(() => ViewFieldDTO)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewFieldResolver {
  constructor(
    @InjectRepository(ViewField, 'core')
    private readonly viewFieldRepository: Repository<ViewField>,
  ) {}

  @Query(() => [ViewFieldDTO])
  @UseGuards(WorkspaceAuthGuard)
  async getCoreViewFields(
    @Args('viewId', { type: () => String }) viewId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewField[]> {
    return this.viewFieldRepository.find({
      where: { viewId, workspaceId: workspace.id },
      order: { position: 'ASC' },
    });
  }

  @Query(() => ViewFieldDTO, { nullable: true })
  @UseGuards(WorkspaceAuthGuard)
  async getCoreViewField(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewField | null> {
    return this.viewFieldRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });
  }

  @Mutation(() => ViewFieldDTO)
  @UseGuards(WorkspaceAuthGuard)
  async updateCoreViewField(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateViewFieldInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewField> {
    const existingViewField = await this.viewFieldRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    if (!existingViewField) {
      throw new Error('ViewField not found');
    }

    await this.viewFieldRepository.update(id, input);

    const updatedViewField = await this.viewFieldRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    if (!updatedViewField) {
      throw new Error('ViewField not found after update');
    }

    return updatedViewField;
  }
}
