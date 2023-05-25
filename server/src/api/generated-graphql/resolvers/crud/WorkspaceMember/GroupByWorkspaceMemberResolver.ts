import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { GroupByWorkspaceMemberArgs } from "./args/GroupByWorkspaceMemberArgs";
import { WorkspaceMember } from "../../../models/WorkspaceMember";
import { WorkspaceMemberGroupBy } from "../../outputs/WorkspaceMemberGroupBy";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => WorkspaceMember)
export class GroupByWorkspaceMemberResolver {
  @TypeGraphQL.Query(_returns => [WorkspaceMemberGroupBy], {
    nullable: false
  })
  async groupByWorkspaceMember(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: GroupByWorkspaceMemberArgs): Promise<WorkspaceMemberGroupBy[]> {
    const { _count, _avg, _sum, _min, _max } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.groupBy({
      ...args,
      ...Object.fromEntries(
        Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
      ),
    });
  }
}
