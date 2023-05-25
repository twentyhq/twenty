import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PersonCreateManyCompanyInputEnvelope } from "../inputs/PersonCreateManyCompanyInputEnvelope";
import { PersonCreateOrConnectWithoutCompanyInput } from "../inputs/PersonCreateOrConnectWithoutCompanyInput";
import { PersonCreateWithoutCompanyInput } from "../inputs/PersonCreateWithoutCompanyInput";
import { PersonScalarWhereInput } from "../inputs/PersonScalarWhereInput";
import { PersonUpdateManyWithWhereWithoutCompanyInput } from "../inputs/PersonUpdateManyWithWhereWithoutCompanyInput";
import { PersonUpdateWithWhereUniqueWithoutCompanyInput } from "../inputs/PersonUpdateWithWhereUniqueWithoutCompanyInput";
import { PersonUpsertWithWhereUniqueWithoutCompanyInput } from "../inputs/PersonUpsertWithWhereUniqueWithoutCompanyInput";
import { PersonWhereUniqueInput } from "../inputs/PersonWhereUniqueInput";

@TypeGraphQL.InputType("PersonUpdateManyWithoutCompanyNestedInput", {
  isAbstract: true
})
export class PersonUpdateManyWithoutCompanyNestedInput {
  @TypeGraphQL.Field(_type => [PersonCreateWithoutCompanyInput], {
    nullable: true
  })
  create?: PersonCreateWithoutCompanyInput[] | undefined;

  @TypeGraphQL.Field(_type => [PersonCreateOrConnectWithoutCompanyInput], {
    nullable: true
  })
  connectOrCreate?: PersonCreateOrConnectWithoutCompanyInput[] | undefined;

  @TypeGraphQL.Field(_type => [PersonUpsertWithWhereUniqueWithoutCompanyInput], {
    nullable: true
  })
  upsert?: PersonUpsertWithWhereUniqueWithoutCompanyInput[] | undefined;

  @TypeGraphQL.Field(_type => PersonCreateManyCompanyInputEnvelope, {
    nullable: true
  })
  createMany?: PersonCreateManyCompanyInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [PersonWhereUniqueInput], {
    nullable: true
  })
  set?: PersonWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PersonWhereUniqueInput], {
    nullable: true
  })
  disconnect?: PersonWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PersonWhereUniqueInput], {
    nullable: true
  })
  delete?: PersonWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PersonWhereUniqueInput], {
    nullable: true
  })
  connect?: PersonWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [PersonUpdateWithWhereUniqueWithoutCompanyInput], {
    nullable: true
  })
  update?: PersonUpdateWithWhereUniqueWithoutCompanyInput[] | undefined;

  @TypeGraphQL.Field(_type => [PersonUpdateManyWithWhereWithoutCompanyInput], {
    nullable: true
  })
  updateMany?: PersonUpdateManyWithWhereWithoutCompanyInput[] | undefined;

  @TypeGraphQL.Field(_type => [PersonScalarWhereInput], {
    nullable: true
  })
  deleteMany?: PersonScalarWhereInput[] | undefined;
}
