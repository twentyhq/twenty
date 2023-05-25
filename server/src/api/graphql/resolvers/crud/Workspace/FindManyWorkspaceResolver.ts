import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindManyWorkspaceArgs } from "./args/FindManyWorkspaceArgs";
import { Workspace } from "../../../models/Workspace";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Workspace)
export class FindManyWorkspaceResolver {
  @TypeGraphQL.Query(_returns => [Workspace], {
    nullable: false
  })
  async workspaces(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindManyWorkspaceArgs): Promise<Workspace[]> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspace.findMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
