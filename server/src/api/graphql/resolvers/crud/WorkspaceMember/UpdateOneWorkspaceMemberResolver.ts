import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { UpdateOneWorkspaceMemberArgs } from "./args/UpdateOneWorkspaceMemberArgs";
import { WorkspaceMember } from "../../../models/WorkspaceMember";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => WorkspaceMember)
export class UpdateOneWorkspaceMemberResolver {
  @TypeGraphQL.Mutation(_returns => WorkspaceMember, {
    nullable: true
  })
  async updateOneWorkspaceMember(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateOneWorkspaceMemberArgs): Promise<WorkspaceMember | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.update({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
