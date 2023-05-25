import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregateWorkspaceMemberArgs } from "./args/AggregateWorkspaceMemberArgs";
import { CreateManyWorkspaceMemberArgs } from "./args/CreateManyWorkspaceMemberArgs";
import { CreateOneWorkspaceMemberArgs } from "./args/CreateOneWorkspaceMemberArgs";
import { DeleteManyWorkspaceMemberArgs } from "./args/DeleteManyWorkspaceMemberArgs";
import { DeleteOneWorkspaceMemberArgs } from "./args/DeleteOneWorkspaceMemberArgs";
import { FindFirstWorkspaceMemberArgs } from "./args/FindFirstWorkspaceMemberArgs";
import { FindFirstWorkspaceMemberOrThrowArgs } from "./args/FindFirstWorkspaceMemberOrThrowArgs";
import { FindManyWorkspaceMemberArgs } from "./args/FindManyWorkspaceMemberArgs";
import { FindUniqueWorkspaceMemberArgs } from "./args/FindUniqueWorkspaceMemberArgs";
import { FindUniqueWorkspaceMemberOrThrowArgs } from "./args/FindUniqueWorkspaceMemberOrThrowArgs";
import { GroupByWorkspaceMemberArgs } from "./args/GroupByWorkspaceMemberArgs";
import { UpdateManyWorkspaceMemberArgs } from "./args/UpdateManyWorkspaceMemberArgs";
import { UpdateOneWorkspaceMemberArgs } from "./args/UpdateOneWorkspaceMemberArgs";
import { UpsertOneWorkspaceMemberArgs } from "./args/UpsertOneWorkspaceMemberArgs";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";
import { WorkspaceMember } from "../../../models/WorkspaceMember";
import { AffectedRowsOutput } from "../../outputs/AffectedRowsOutput";
import { AggregateWorkspaceMember } from "../../outputs/AggregateWorkspaceMember";
import { WorkspaceMemberGroupBy } from "../../outputs/WorkspaceMemberGroupBy";

@TypeGraphQL.Resolver(_of => WorkspaceMember)
export class WorkspaceMemberCrudResolver {
  @TypeGraphQL.Query(_returns => AggregateWorkspaceMember, {
    nullable: false
  })
  async aggregateWorkspaceMember(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregateWorkspaceMemberArgs): Promise<AggregateWorkspaceMember> {
    return getPrismaFromContext(ctx).workspaceMember.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async createManyWorkspaceMember(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateManyWorkspaceMemberArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.createMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => WorkspaceMember, {
    nullable: false
  })
  async createOneWorkspaceMember(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateOneWorkspaceMemberArgs): Promise<WorkspaceMember> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async deleteManyWorkspaceMember(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: DeleteManyWorkspaceMemberArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.deleteMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

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

  @TypeGraphQL.Query(_returns => WorkspaceMember, {
    nullable: true
  })
  async findFirstWorkspaceMember(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstWorkspaceMemberArgs): Promise<WorkspaceMember | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

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

  @TypeGraphQL.Query(_returns => WorkspaceMember, {
    nullable: true
  })
  async workspaceMember(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueWorkspaceMemberArgs): Promise<WorkspaceMember | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.findUnique({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

  @TypeGraphQL.Query(_returns => WorkspaceMember, {
    nullable: true
  })
  async getWorkspaceMember(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindUniqueWorkspaceMemberOrThrowArgs): Promise<WorkspaceMember | null> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.findUniqueOrThrow({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

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

  @TypeGraphQL.Mutation(_returns => AffectedRowsOutput, {
    nullable: false
  })
  async updateManyWorkspaceMember(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpdateManyWorkspaceMemberArgs): Promise<AffectedRowsOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.updateMany({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }

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

  @TypeGraphQL.Mutation(_returns => WorkspaceMember, {
    nullable: false
  })
  async upsertOneWorkspaceMember(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertOneWorkspaceMemberArgs): Promise<WorkspaceMember> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    return getPrismaFromContext(ctx).workspaceMember.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
