import { PrismaClient } from '@prisma/client';
import { Person, User } from './local-graphql/models';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { FindManyUserArgs } from './local-graphql/resolvers/crud/User/args/FindManyUserArgs';

@Resolver(() => User)
export class UserResolvers {
  constructor(private readonly prismaClient: PrismaClient) {}

  @Query(() => [User], {
    nullable: false,
  })
  async users(@Args() args: FindManyUserArgs): Promise<User[]> {
    return this.prismaClient.user.findMany({
      ...args,
    });
  }
}
