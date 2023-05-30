import { Resolver, Query, Args } from '@nestjs/graphql';
import { PrismaService } from 'src/database/prisma.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { AuthWorkspace } from './decorators/auth-user.decorator';

import { User } from '../@generated/user/user.model';
import { FindManyUserArgs } from '../@generated/user/find-many-user.args';
import { FindUniqueUserOrThrowArgs } from '../@generated/user/find-unique-user-or-throw.args';
import { Workspace } from '@prisma/client';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [User], {
    nullable: false,
  })
  async users(
    @Args() args: FindManyUserArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<User[]> {
    return await this.prismaService.user.findMany({
      ...args,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User, {
    nullable: false,
  })
  async user(@Args() args: FindUniqueUserOrThrowArgs): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      ...args,
    });
  }
}
