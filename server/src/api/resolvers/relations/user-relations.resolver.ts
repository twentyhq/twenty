import * as TypeGraphQL from '@nestjs/graphql';
import type { GraphQLResolveInfo } from 'graphql';
import { Company } from '../../generated-graphql/models/Company';
import { RefreshToken } from '../../generated-graphql/models/RefreshToken';
import { User } from '../../generated-graphql/models/User';
import { WorkspaceMember } from '../../generated-graphql/models/WorkspaceMember';
import { PrismaClient } from '@prisma/client';
import { UserCompaniesArgs } from '../../generated-graphql/resolvers/relations/User/args/UserCompaniesArgs';
import { UserRefreshTokensArgs } from '../../generated-graphql/resolvers/relations/User/args/UserRefreshTokensArgs';
import { PrismaService } from 'src/database/prisma.service';

@TypeGraphQL.Resolver(() => User)
export class UserRelationsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @TypeGraphQL.ResolveField(() => WorkspaceMember, {
    nullable: true,
  })
  async WorkspaceMember(
    @TypeGraphQL.Parent() user: User,
  ): Promise<WorkspaceMember | null> {
    return await this.prismaService.user
      .findFirst({
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
  async RefreshTokens(
    @TypeGraphQL.Parent() user: User,
    @TypeGraphQL.Info() info: GraphQLResolveInfo,
    @TypeGraphQL.Args() args: UserRefreshTokensArgs,
  ): Promise<RefreshToken[]> {
    return this.prismaService.user
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
