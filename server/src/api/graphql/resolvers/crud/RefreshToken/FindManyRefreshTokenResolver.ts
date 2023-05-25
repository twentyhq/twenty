import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindManyRefreshTokenArgs } from "./args/FindManyRefreshTokenArgs";
import { RefreshToken } from "../../../models/RefreshToken";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => RefreshToken)
export class FindManyRefreshTokenResolver {
  @TypeGraphQL.Query(_returns => [RefreshToken], {
    nullable: false
  })
  async refreshTokens(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyRefreshTokenArgs): Promise<RefreshToken[]> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).refreshToken.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
