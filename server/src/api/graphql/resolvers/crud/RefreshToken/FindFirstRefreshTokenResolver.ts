import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindFirstRefreshTokenArgs } from "./args/FindFirstRefreshTokenArgs";
import { RefreshToken } from "../../../models/RefreshToken";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => RefreshToken)
export class FindFirstRefreshTokenResolver {
  @TypeGraphQL.Query(_returns => RefreshToken, {
    nullable: true
  })
  async findFirstRefreshToken(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstRefreshTokenArgs): Promise<RefreshToken | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).refreshToken.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
