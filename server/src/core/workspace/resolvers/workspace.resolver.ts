import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Workspace } from 'src/core/@generated/workspace/workspace.model';
import { WorkspaceService } from '../services/workspace.service';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { User } from 'src/core/@generated/user/user.model';
import { CreateOneWorkspaceArgs } from 'src/core/@generated/workspace/create-one-workspace.args';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';

@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Mutation(() => Workspace)
  async createWorkspace(
    @Args() args: CreateOneWorkspaceArgs,
    @AuthUser() user: User,
    @PrismaSelector({ modelName: 'Workspace' })
    prismaSelect: PrismaSelect<'Workspace'>,
  ) {
    return this.workspaceService.create({
      data: {
        ...args.data,
        workspaceMember: {
          connect: {
            userId: user.id,
          },
        },
      },
      select: prismaSelect.value,
    });
  }
}
