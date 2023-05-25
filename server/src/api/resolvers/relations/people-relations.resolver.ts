import * as TypeGraphQL from '@nestjs/graphql';
import { Company } from '../../generated-graphql/models/Company';
import { Person } from '../../generated-graphql/models/Person';
import { Workspace } from '../../generated-graphql/models/Workspace';
import { PrismaClient } from '@prisma/client';

@TypeGraphQL.Resolver(() => Person)
export class PersonRelationsResolver {
  constructor(private readonly prismaClient: PrismaClient) {}

  @TypeGraphQL.ResolveField(() => Company, {
    nullable: true,
  })
  async company(@TypeGraphQL.Parent() person: Person): Promise<Company | null> {
    return this.prismaClient.person
      .findUniqueOrThrow({
        where: {
          id: person.id,
        },
      })
      .company({});
  }

  @TypeGraphQL.ResolveField(() => Workspace, {
    nullable: false,
  })
  async workspace(@TypeGraphQL.Parent() person: Person): Promise<Workspace> {
    return this.prismaClient.person
      .findUniqueOrThrow({
        where: {
          id: person.id,
        },
      })
      .workspace({});
  }
}
