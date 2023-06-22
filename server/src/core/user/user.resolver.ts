import { Args, Resolver, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { FindManyUserArgs } from 'src/core/@generated/user/find-many-user.args';
import { Workspace } from '@prisma/client';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { User } from 'src/core/@generated/user/user.model';
import { ExceptionFilter } from 'src/filters/exception.filter';
import { UseFilters, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseFilters(ExceptionFilter)
  @Query(() => [User], {
    nullable: false,
  })
  async findManyUser(
    @Args() args: FindManyUserArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'User' })
    prismaSelect: PrismaSelect<'User'>,
  ): Promise<Partial<User>[]> {
    return await this.userService.findMany({
      ...args,
      where: {
        ...args.where,
        workspaceMember: {
          is: { workspace: { is: { id: { equals: workspace.id } } } },
        },
      },
      select: prismaSelect.value,
    });
  }
}
