import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindManyWorkspaceMemberArgs } from "./args/FindManyWorkspaceMemberArgs";
import { WorkspaceMember } from "../../../models/WorkspaceMember";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => WorkspaceMember)
export class FindManyWorkspaceMemberResolver {
  @TypeGraphQL.Query(_returns => [WorkspaceMember], {
    nullable: false
  })
  async workspaceMembers(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyWorkspaceMemberArgs): Promise<WorkspaceMember[]> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
