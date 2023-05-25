import * as TypeGraphQL from "type-graphql";
import type { GraphQLResolveInfo } from "graphql";
import { AggregatePersonArgs } from "./args/AggregatePersonArgs";
import { Person } from "../../../models/Person";
import { AggregatePerson } from "../../outputs/AggregatePerson";
import { transformInfoIntoPrismaArgs, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Person)
export class AggregatePersonResolver {
  @TypeGraphQL.Query(_returns => AggregatePerson, {
    nullable: false
  })
  async aggregatePerson(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: AggregatePersonArgs): Promise<AggregatePerson> {
    return getPrismaFromContext(ctx).person.aggregate({
      ...args,
      ...transformInfoIntoPrismaArgs(info),
    });
  }
}
