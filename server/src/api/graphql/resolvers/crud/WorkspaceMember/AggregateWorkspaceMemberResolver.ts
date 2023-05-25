import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregateWorkspaceMemberArgs } from "./args/AggregateWorkspaceMemberArgs";
import { WorkspaceMember } from "../../../models/WorkspaceMember";
import { AggregateWorkspaceMember } from "../../outputs/AggregateWorkspaceMember";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => WorkspaceMember)
export class AggregateWorkspaceMemberResolver {
  @TypeGraphQL.Query(_returns => AggregateWorkspaceMember, {
    nullable: false
  })
  async aggregateWorkspaceMember(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateWorkspaceMemberArgs): Promise<AggregateWorkspaceMember> {
    return getPrismaFromContext(ctx).workspaceMember.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
