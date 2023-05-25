import * as TypeGraphQL from '@nestjs/graphql';
import { Company } from '../../generated-graphql/models/Company';
import { Person } from '../../generated-graphql/models/Person';
import { User } from '../../generated-graphql/models/User';
import { Workspace } from '../../generated-graphql/models/Workspace';
import { PrismaClient } from '@prisma/client';
import { CompanyPeopleArgs } from '../../generated-graphql/resolvers/relations/Company/args/CompanyPeopleArgs';

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
