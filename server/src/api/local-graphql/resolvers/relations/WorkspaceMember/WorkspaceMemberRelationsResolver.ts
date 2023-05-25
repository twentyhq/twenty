import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { User } from "../../../models/User";
import { Workspace } from "../../../models/Workspace";
import { WorkspaceMember } from "../../../models/WorkspaceMember";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => WorkspaceMember)
export class WorkspaceMemberRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => User, {
    nullable: false
  })
  async user(@TypeGraphQL.Root() workspaceMember: WorkspaceMember, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo): Promise<User> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.findUniqueOrThrow({
      where: {
        id: workspaceMember.id,
      },
    }).user({
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.FieldResolver(_type => Workspace, {
    nullable: false
  })
  async workspace(@TypeGraphQL.Root() workspaceMember: WorkspaceMember, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo): Promise<Workspace> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.findUniqueOrThrow({
      where: {
        id: workspaceMember.id,
      },
    }).workspace({
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
