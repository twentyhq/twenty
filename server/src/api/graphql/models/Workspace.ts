import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { Company } from "../models/Company";
import { Person } from "../models/Person";
import { WorkspaceMember } from "../models/WorkspaceMember";
import { WorkspaceCount } from "../resolvers/outputs/WorkspaceCount";

@TypeGraphQL.ObjectType("Workspace", {
  isAbstract: true
})
export class Workspace {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedAt?: Date | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  domainName!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  displayName!: string;

  WorkspaceMember?: WorkspaceMember[];

  companies?: Company[];

  people?: Person[];

  @TypeGraphQL.Field(_type => WorkspaceCount, {
    nullable: true
  })
  _count?: WorkspaceCount | null;
}
