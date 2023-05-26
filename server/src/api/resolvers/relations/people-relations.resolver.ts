import * as TypeGraphQL from '@nestjs/graphql';
import { Company } from 'src/api/@generated/company/company.model';
import { Person } from 'src/api/@generated/person/person.model';
import { Workspace } from 'src/api/@generated/workspace/workspace.model';
import { PrismaService } from 'src/database/prisma.service';

@TypeGraphQL.Resolver(() => Person)
export class PersonRelationsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @TypeGraphQL.ResolveField(() => Company, {
    nullable: true,
  })
  async company(@TypeGraphQL.Parent() person: Person): Promise<Company | null> {
    return await this.prismaService.person
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
    return this.prismaService.person
      .findUniqueOrThrow({
        where: {
          id: person.id,
        },
      })
      .workspace({});
  }
}
