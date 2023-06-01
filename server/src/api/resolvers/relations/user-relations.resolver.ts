import * as TypeGraphQL from '@nestjs/graphql';
import type { GraphQLResolveInfo } from 'graphql';
import { PrismaService } from 'src/database/prisma.service';
import { WorkspaceMember } from 'src/api/@generated/workspace-member/workspace-member.model';
import { User } from 'src/api/@generated/user/user.model';
import { Company } from 'src/api/@generated/company/company.model';
import { RefreshToken } from 'src/api/@generated/refresh-token/refresh-token.model';
import { FindManyCompanyArgs } from 'src/api/@generated/company/find-many-company.args';
import { FindManyRefreshTokenArgs } from 'src/api/@generated/refresh-token/find-many-refresh-token.args';

@TypeGraphQL.Resolver(() => User)
export class UserRelationsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @TypeGraphQL.ResolveField(() => WorkspaceMember, {
    nullable: true,
  })
  async workspaceMember(
    @TypeGraphQL.Parent() user: User,
  ): Promise<WorkspaceMember | null> {
    return await this.prismaService.user
      .findFirst({
        where: {
          id: user.id,
        },
      })
      .workspaceMember({});
  }

  @TypeGraphQL.ResolveField(() => [Company], {
    nullable: false,
  })
  async companies(
    @TypeGraphQL.Parent() user: User,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManyCompanyArgs,
  ): Promise<Company[]> {
    return this.prismaService.user
      .findUniqueOrThrow({
        where: {
          id: user.id,
        },
      })
      .companies({
        ...args,
      });
  }

  @TypeGraphQL.ResolveField(() => [RefreshToken], {
    nullable: false,
  })
  async refreshTokens(
    @TypeGraphQL.Parent() user: User,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: FindManyRefreshTokenArgs,
  ): Promise<RefreshToken[]> {
    return this.prismaService.user
      .findUniqueOrThrow({
        where: {
          id: user.id,
        },
      })
      .refreshTokens({
        ...args,
      });
  }
}
