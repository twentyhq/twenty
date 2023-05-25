import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { WorkspaceCreateOrConnectWithoutWorkspaceMemberInput } from "../inputs/WorkspaceCreateOrConnectWithoutWorkspaceMemberInput";
import { WorkspaceCreateWithoutWorkspaceMemberInput } from "../inputs/WorkspaceCreateWithoutWorkspaceMemberInput";
import { WorkspaceUpdateWithoutWorkspaceMemberInput } from "../inputs/WorkspaceUpdateWithoutWorkspaceMemberInput";
import { WorkspaceUpsertWithoutWorkspaceMemberInput } from "../inputs/WorkspaceUpsertWithoutWorkspaceMemberInput";
import { WorkspaceWhereUniqueInput } from "../inputs/WorkspaceWhereUniqueInput";

@TypeGraphQL.InputType("WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput", {
  isAbstract: true
})
export class WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput {
  @TypeGraphQL.Field(_type => WorkspaceCreateWithoutWorkspaceMemberInput, {
    nullable: true
  })
  create?: WorkspaceCreateWithoutWorkspaceMemberInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceCreateOrConnectWithoutWorkspaceMemberInput, {
    nullable: true
  })
  connectOrCreate?: WorkspaceCreateOrConnectWithoutWorkspaceMemberInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceUpsertWithoutWorkspaceMemberInput, {
    nullable: true
  })
  upsert?: WorkspaceUpsertWithoutWorkspaceMemberInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceWhereUniqueInput, {
    nullable: true
  })
  connect?: WorkspaceWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceUpdateWithoutWorkspaceMemberInput, {
    nullable: true
  })
  update?: WorkspaceUpdateWithoutWorkspaceMemberInput | undefined;
}
