import * as TypeGraphQL from '@nestjs/graphql';
import type { GraphQLResolveInfo } from 'graphql';
import { Company } from './local-graphql/models/Company';
import { Person } from './local-graphql/models/Person';
import { User } from './local-graphql/models/User';
import { Workspace } from './local-graphql/models/Workspace';
import { PrismaClient } from '@prisma/client';
import { CompanyPeopleArgs } from './local-graphql/resolvers/relations/Company/args/CompanyPeopleArgs';

@TypeGraphQL.Resolver(() => Company)
export class CompanyRelationsResolver {
  constructor(private readonly prismaClient: PrismaClient) {}

  @TypeGraphQL.ResolveField(() => User, {
    nullable: true,
  })
  async accountOwner(
    @TypeGraphQL.Parent() company: Company,
  ): Promise<User | null> {
    return this.prismaClient.company
      .findUniqueOrThrow({
        where: {
          id: company.id,
        },
      })
      .accountOwner({});
  }

  @TypeGraphQL.ResolveField(() => [Person], {
    nullable: false,
  })
  async people(
    @TypeGraphQL.Root() company: Company,
    @TypeGraphQL.Args() args: CompanyPeopleArgs,
  ): Promise<Person[]> {
    return this.prismaClient.company
      .findUniqueOrThrow({
        where: {
          id: company.id,
        },
      })
      .people({
        ...args,
      });
  }

  @TypeGraphQL.ResolveField(() => Workspace, {
    nullable: false,
  })
  async workspace(@TypeGraphQL.Root() company: Company): Promise<Workspace> {
    return this.prismaClient.company
      .findUniqueOrThrow({
        where: {
          id: company.id,
        },
      })
      .workspace({});
  }
}
