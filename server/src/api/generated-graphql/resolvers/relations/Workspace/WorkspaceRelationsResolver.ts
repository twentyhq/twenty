import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { Company } from "../../../models/Company";
import { Person } from "../../../models/Person";
import { Workspace } from "../../../models/Workspace";
import { WorkspaceMember } from "../../../models/WorkspaceMember";
import { WorkspaceCompaniesArgs } from "./args/WorkspaceCompaniesArgs";
import { WorkspacePeopleArgs } from "./args/WorkspacePeopleArgs";
import { WorkspaceWorkspaceMemberArgs } from "./args/WorkspaceWorkspaceMemberArgs";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Workspace)
export class WorkspaceRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => [WorkspaceMember], {
    nullable: false
  })
  async WorkspaceMember(@TypeGraphQL.Root() workspace: Workspace, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: WorkspaceWorkspaceMemberArgs): Promise<WorkspaceMember[]> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspace.findUniqueOrThrow({
      where: {
        id: workspace.id,
      },
    }).WorkspaceMember({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.FieldResolver(_type => [Company], {
    nullable: false
  })
  async companies(@TypeGraphQL.Root() workspace: Workspace, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: WorkspaceCompaniesArgs): Promise<Company[]> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspace.findUniqueOrThrow({
      where: {
        id: workspace.id,
      },
    }).companies({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.FieldResolver(_type => [Person], {
    nullable: false
  })
  async people(@TypeGraphQL.Root() workspace: Workspace, @TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: WorkspacePeopleArgs): Promise<Person[]> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspace.findUniqueOrThrow({
      where: {
        id: workspace.id,
      },
    }).people({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
