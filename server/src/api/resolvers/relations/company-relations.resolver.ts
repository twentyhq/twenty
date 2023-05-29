import * as TypeGraphQL from '@nestjs/graphql';
import { Company } from 'src/api/@generated/company/company.model';
import { User } from 'src/api/@generated/user/user.model';
import { Workspace } from 'src/api/@generated/workspace/workspace.model';
import { PrismaService } from 'src/database/prisma.service';

@TypeGraphQL.Resolver(() => Company)
export class CompanyRelationsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @TypeGraphQL.ResolveField(() => User, {
    nullable: true,
  })
  async accountOwner(
    @TypeGraphQL.Parent() company: Company,
  ): Promise<User | null> {
    return this.prismaService.company
      .findUniqueOrThrow({
        where: {
          id: company.id,
        },
      })
      .accountOwner({});
  }

  @TypeGraphQL.ResolveField(() => Workspace, {
    nullable: false,
  })
  async workspace(@TypeGraphQL.Root() company: Company): Promise<Workspace> {
    return this.prismaService.company
      .findUniqueOrThrow({
        where: {
          id: company.id,
        },
      })
      .workspace({});
  }
}
