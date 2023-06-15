import { Args, Resolver, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { FindManyUserArgs } from 'src/core/@generated/user/find-many-user.args';
import { Workspace } from '@prisma/client';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { User } from 'src/core/@generated/user/user.model';
import { ExceptionFilter } from 'src/filters/exception.filter';
import { UseFilters, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

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
  ): Promise<User[]> {
    return await this.userService.findMany({
      ...args,
      where: {
        ...args.where,
        workspaceMember: {
          is: { workspace: { is: { id: { equals: workspace.id } } } },
        },
      },
    });
  }
}
