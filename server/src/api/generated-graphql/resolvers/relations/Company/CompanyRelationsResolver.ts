import * as TypeGraphQL from '@nestjs/graphql';
import type { GraphQLResolveInfo } from 'graphql';
import { Company } from '../../../models/Company';
import { Person } from '../../../models/Person';
import { User } from '../../../models/User';
import { Workspace } from '../../../models/Workspace';
import { CompanyPeopleArgs } from './args/CompanyPeopleArgs';
import {
  transformInfoIntoPrismaArgs,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';
import { PrismaClient } from '@prisma/client';

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
  async workspace(
    @TypeGraphQL.Root() company: Company,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
  ): Promise<Workspace> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return this.prismaClient.company
      .findUniqueOrThrow({
        where: {
          id: company.id,
        },
      })
      .workspace({
        ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
      });
  }
}
