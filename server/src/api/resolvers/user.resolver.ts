import { Resolver, Query, Args } from '@nestjs/graphql';
import { PrismaService } from 'src/database/prisma.service';
import { UseFilters, UseGuards } from '@nestjs/common';

import { User } from '../@generated/user/user.model';
import { FindManyUserArgs } from '../@generated/user/find-many-user.args';
import { Workspace } from '@prisma/client';
import { AuthWorkspace } from './decorators/auth-workspace.decorator';
import { ExceptionFilter } from './exception-filters/exception.filter';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @UseFilters(ExceptionFilter)
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
        workspaceMember: {
          is: { workspace: { is: { id: { equals: workspace.id } } } },
        },
      },
    };
    return await this.prismaService.user.findMany({
      ...args,
    });
  }
}
