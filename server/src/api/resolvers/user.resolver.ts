import { Resolver, Query, Args } from '@nestjs/graphql';
import { PrismaService } from 'src/database/prisma.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

import { User } from '../@generated/user/user.model';
import { FindManyUserArgs } from '../@generated/user/find-many-user.args';
import { Workspace } from '@prisma/client';
import { AuthWorkspace } from './decorators/auth-workspace.decorator';
import { ArgsService } from './services/args.service';
import { CheckWorkspaceOwnership } from 'src/auth/guards/check-workspace-ownership.guard';

@UseGuards(JwtAuthGuard, CheckWorkspaceOwnership)
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly argsService: ArgsService,
  ) {}

  @Query(() => [User], {
    nullable: false,
  })
  async findManyUser(
    @Args() args: FindManyUserArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<User[]> {
    args.where = {
      ...args.where,
      ...{
        WorkspaceMember: {
          is: { workspace: { is: { id: { equals: workspace.id } } } },
        },
      },
    };
    return await this.prismaService.user.findMany({
      ...args,
    });
  }
}
