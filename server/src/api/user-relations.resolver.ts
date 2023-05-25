import * as TypeGraphQL from '@nestjs/graphql';
import type { GraphQLResolveInfo } from 'graphql';
import { Company } from './local-graphql/models/Company';
import { RefreshToken } from './local-graphql/models/RefreshToken';
import { User } from './local-graphql/models/User';
import { WorkspaceMember } from './local-graphql/models/WorkspaceMember';
import { PrismaClient } from '@prisma/client';
import { UserCompaniesArgs } from './local-graphql/resolvers/relations/User/args/UserCompaniesArgs';
import { UserRefreshTokensArgs } from './local-graphql/resolvers/relations/User/args/UserRefreshTokensArgs';

@TypeGraphQL.Resolver(() => User)
export class UserRelationsResolver {
  constructor(private readonly prismaClient: PrismaClient) {}

  @TypeGraphQL.ResolveField(() => WorkspaceMember, {
    nullable: true,
  })
  async WorkspaceMember(
    @TypeGraphQL.Parent() user: User,
  ): Promise<WorkspaceMember | null> {
    return this.prismaClient.user
      .findUniqueOrThrow({
        where: {
          id: user.id,
        },
      })
      .WorkspaceMember({});
  }

  @TypeGraphQL.ResolveField(() => [Company], {
    nullable: false,
  })
  async companies(
    @TypeGraphQL.Parent() user: User,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UserCompaniesArgs,
  ): Promise<Company[]> {
    return this.prismaClient.user
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
  async RefreshTokens(
    @TypeGraphQL.Parent() user: User,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UserRefreshTokensArgs,
  ): Promise<RefreshToken[]> {
    return this.prismaClient.user
      .findUniqueOrThrow({
        where: {
          id: user.id,
        },
      })
      .RefreshTokens({
        ...args,
      });
  }
}
