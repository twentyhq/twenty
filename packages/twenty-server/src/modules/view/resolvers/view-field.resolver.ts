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

@Resolver(() => ViewField)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class ViewFieldResolver {
  constructor(
    @InjectRepository(ViewField, 'core')
    private readonly viewFieldRepository: Repository<ViewField>,
  ) {}

  @Query(() => [ViewField])
  @UseGuards(WorkspaceAuthGuard)
  async findManyViewFields(
    @AuthWorkspace() workspace: Workspace,
    @Args('viewId', { type: () => String, nullable: true })
    viewId?: string,
  ): Promise<ViewField[]> {
    const whereClause: { workspaceId: string; viewId?: string } = {
      workspaceId: workspace.id,
    };

    if (viewId) {
      whereClause.viewId = viewId;
    }

    const viewFields = await this.viewFieldRepository.find({
      where: whereClause,
      order: { position: 'ASC' },
    });

    return viewFields;
  }

  @Query(() => ViewField, { nullable: true })
  @UseGuards(WorkspaceAuthGuard)
  async findOneViewField(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ViewField | null> {
    const viewField = await this.viewFieldRepository.findOne({
      where: { id, workspaceId: workspace.id },
    });

    return viewField;
  }

  @Mutation(() => ViewField)
  @UseGuards(WorkspaceAuthGuard)
  async updateViewField(
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
