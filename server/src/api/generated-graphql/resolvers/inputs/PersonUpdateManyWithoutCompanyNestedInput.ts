import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PersonCreateManyCompanyInputEnvelope } from './PersonCreateManyCompanyInputEnvelope';
import { PersonCreateOrConnectWithoutCompanyInput } from './PersonCreateOrConnectWithoutCompanyInput';
import { PersonCreateWithoutCompanyInput } from './PersonCreateWithoutCompanyInput';
import { PersonScalarWhereInput } from './PersonScalarWhereInput';
import { PersonUpdateManyWithWhereWithoutCompanyInput } from './PersonUpdateManyWithWhereWithoutCompanyInput';
import { PersonUpdateWithWhereUniqueWithoutCompanyInput } from './PersonUpdateWithWhereUniqueWithoutCompanyInput';
import { PersonUpsertWithWhereUniqueWithoutCompanyInput } from './PersonUpsertWithWhereUniqueWithoutCompanyInput';
import { PersonWhereUniqueInput } from './PersonWhereUniqueInput';

@TypeGraphQL.InputType('PersonUpdateManyWithoutCompanyNestedInput', {
  isAbstract: true,
})
export class PersonUpdateManyWithoutCompanyNestedInput {
  @TypeGraphQL.Field((_type) => [PersonCreateWithoutCompanyInput], {
    nullable: true,
  })
  create?: PersonCreateWithoutCompanyInput[] | undefined;

  @TypeGraphQL.Field((_type) => [PersonCreateOrConnectWithoutCompanyInput], {
    nullable: true,
  })
  connectOrCreate?: PersonCreateOrConnectWithoutCompanyInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [PersonUpsertWithWhereUniqueWithoutCompanyInput],
    {
      nullable: true,
    },
  )
  upsert?: PersonUpsertWithWhereUniqueWithoutCompanyInput[] | undefined;

  @TypeGraphQL.Field((_type) => PersonCreateManyCompanyInputEnvelope, {
    nullable: true,
  })
  createMany?: PersonCreateManyCompanyInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [PersonWhereUniqueInput], {
    nullable: true,
  })
  set?: PersonWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [PersonWhereUniqueInput], {
    nullable: true,
  })
  disconnect?: PersonWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [PersonWhereUniqueInput], {
    nullable: true,
  })
  delete?: PersonWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field((_type) => [PersonWhereUniqueInput], {
    nullable: true,
  })
  connect?: PersonWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [PersonUpdateWithWhereUniqueWithoutCompanyInput],
    {
      nullable: true,
    },
  )
  update?: PersonUpdateWithWhereUniqueWithoutCompanyInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [PersonUpdateManyWithWhereWithoutCompanyInput],
    {
      nullable: true,
    },
  )
  updateMany?: PersonUpdateManyWithWhereWithoutCompanyInput[] | undefined;

  @TypeGraphQL.Field((_type) => [PersonScalarWhereInput], {
    nullable: true,
  })
  deleteMany?: PersonScalarWhereInput[] | undefined;
}
