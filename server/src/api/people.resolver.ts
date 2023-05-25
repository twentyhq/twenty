import { PrismaClient } from '@prisma/client';
import { Person } from './local-graphql/models';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { FindManyPersonArgs } from './local-graphql/resolvers/crud/Person/args/FindManyPersonArgs';
import { UpdateOnePersonArgs } from './local-graphql/resolvers/crud/Person/args/UpdateOnePersonArgs';
import { CreateOnePersonArgs } from './local-graphql/resolvers/crud/Person/args/CreateOnePersonArgs';
import { DeleteManyPersonArgs } from './local-graphql/resolvers/crud/Person/args/DeleteManyPersonArgs';
import { AffectedRowsOutput } from './local-graphql/resolvers/outputs/AffectedRowsOutput';

@Resolver(() => Person)
export class PeopleResolvers {
  constructor(private readonly prismaClient: PrismaClient) {}

  @Query(() => [Person], {
    nullable: false,
  })
  async people(@Args() args: FindManyPersonArgs): Promise<Person[]> {
    return this.prismaClient.person.findMany({
      ...args,
    });
  }

  @Mutation(() => Person, {
    nullable: true,
  })
  async updateOnePerson(
    @Args() args: UpdateOnePersonArgs,
  ): Promise<Person | null> {
    return this.prismaClient.person.update({
      ...args,
    });
  }

  @Mutation(() => Person, {
    nullable: false,
  })
  async createOnePerson(@Args() args: CreateOnePersonArgs): Promise<Person> {
    return this.prismaClient.person.create({
      ...args,
    });
  }

  @Mutation(() => AffectedRowsOutput, {
    nullable: false,
  })
  async deleteManyPerson(
    @Args() args: DeleteManyPersonArgs,
  ): Promise<AffectedRowsOutput> {
    return this.prismaClient.person.deleteMany({
      ...args,
    });
  }
}
