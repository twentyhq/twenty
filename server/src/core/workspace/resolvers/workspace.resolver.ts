import { Query, Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Workspace } from 'src/core/@generated/workspace/workspace.model';
import { WorkspaceService } from '../services/workspace.service';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { WorkspaceUpdateInput } from 'src/core/@generated/workspace/workspace-update.input';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Prisma } from '@prisma/client';
import { assert } from 'src/utils/assert';

@UseGuards(JwtAuthGuard)
@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Mutation(() => Workspace)
  async updateWorkspace(
    @Args('data') data: WorkspaceUpdateInput,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'Workspace' })
    prismaSelect: PrismaSelect<'Workspace'>,
  ) {
    return this.workspaceService.update({
      where: {
        id: workspace.id,
      },
      data: {
        ...data,
      },
      select: prismaSelect.value,
    } as Prisma.WorkspaceUpdateArgs);
  }

  @Query(() => Workspace)
  async currentWorkspace(
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'User' })
    prismaSelect: PrismaSelect<'User'>,
  ) {
    const selectedWorkspace = await this.workspaceService.findUnique({
      where: {
        id: workspace.id,
      },
      select: prismaSelect.value,
    });
    assert(selectedWorkspace, 'User not found');

    return selectedWorkspace;
  }
}
