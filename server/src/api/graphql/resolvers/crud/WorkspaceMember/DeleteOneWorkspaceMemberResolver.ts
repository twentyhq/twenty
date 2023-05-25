import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { DeleteOneWorkspaceMemberArgs } from "./args/DeleteOneWorkspaceMemberArgs";
import { WorkspaceMember } from "../../../models/WorkspaceMember";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => WorkspaceMember)
export class DeleteOneWorkspaceMemberResolver {
  @TypeGraphQL.Mutation(_returns => WorkspaceMember, {
    nullable: true
  })
  async deleteOneWorkspaceMember(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteOneWorkspaceMemberArgs): Promise<WorkspaceMember | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.delete({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
