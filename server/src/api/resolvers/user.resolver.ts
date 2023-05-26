import { Person, User } from '../generated-graphql/models';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { FindManyUserArgs } from '../generated-graphql/resolvers/crud/User/args/FindManyUserArgs';
import { FindUniqueUserOrThrowArgs } from '../generated-graphql';
import { PrismaService } from 'src/database/prisma.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query(() => [User], {
    nullable: false,
  })
  async users(@Args() args: FindManyUserArgs): Promise<User[]> {
    return await this.prismaService.user.findMany({
      ...args,
    });
  }

  @Query(() => User, {
    nullable: false,
  })
  async user(@Args() args: FindUniqueUserOrThrowArgs): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      ...args,
    });
  }
}
