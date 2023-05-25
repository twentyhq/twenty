import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { FindFirstWorkspaceMemberOrThrowArgs } from "./args/FindFirstWorkspaceMemberOrThrowArgs";
import { WorkspaceMember } from "../../../models/WorkspaceMember";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => WorkspaceMember)
export class FindFirstWorkspaceMemberOrThrowResolver {
  @TypeGraphQL.Query(_returns => WorkspaceMember, {
    nullable: true
  })
  async findFirstWorkspaceMemberOrThrow(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstWorkspaceMemberOrThrowArgs): Promise<WorkspaceMember | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.findFirstOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
