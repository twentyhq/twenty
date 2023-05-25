import { PrismaClient } from '@prisma/client';
import { Person, User } from '../generated-graphql/models';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { FindManyUserArgs } from '../generated-graphql/resolvers/crud/User/args/FindManyUserArgs';
import { FindUniqueUserOrThrowArgs } from '../generated-graphql';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly prismaClient: PrismaClient) {}

  @Query(() => [User], {
    nullable: false,
  })
  async users(@Args() args: FindManyUserArgs): Promise<User[]> {
    return this.prismaClient.user.findMany({
      ...args,
    });
  }

  @Query(() => User, {
    nullable: true,
  })
  async getUser(@Args() args: FindUniqueUserOrThrowArgs): Promise<User | null> {
    return this.prismaClient.user.findUniqueOrThrow({
      ...args,
    });
  }
}
