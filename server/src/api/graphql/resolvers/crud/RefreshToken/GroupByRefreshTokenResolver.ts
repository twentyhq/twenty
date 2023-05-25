import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { GroupByRefreshTokenArgs } from "./args/GroupByRefreshTokenArgs";
import { RefreshToken } from "../../../models/RefreshToken";
import { RefreshTokenGroupBy } from "../../outputs/RefreshTokenGroupBy";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => RefreshToken)
export class GroupByRefreshTokenResolver {
  @TypeGraphQL.Query(_returns => [RefreshTokenGroupBy], {
    nullable: false
  })
  async groupByRefreshToken(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByRefreshTokenArgs): Promise<RefreshTokenGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).refreshToken.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
