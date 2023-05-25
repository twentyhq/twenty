import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PersonCreateManyCompanyInputEnvelope } from '../inputs/PersonCreateManyCompanyInputEnvelope';
import { PersonCreateOrConnectWithoutCompanyInput } from '../inputs/PersonCreateOrConnectWithoutCompanyInput';
import { PersonCreateWithoutCompanyInput } from '../inputs/PersonCreateWithoutCompanyInput';
import { PersonWhereUniqueInput } from '../inputs/PersonWhereUniqueInput';

@TypeGraphQL.InputType('PersonCreateNestedManyWithoutCompanyInput', {
  isAbstract: true,
})
export class PersonCreateNestedManyWithoutCompanyInput {
  @TypeGraphQL.Field((_type) => [PersonCreateWithoutCompanyInput], {
    nullable: true,
  })
  create?: PersonCreateWithoutCompanyInput[] | undefined;

  @TypeGraphQL.Field((_type) => [PersonCreateOrConnectWithoutCompanyInput], {
    nullable: true,
  })
  connectOrCreate?: PersonCreateOrConnectWithoutCompanyInput[] | undefined;

  @TypeGraphQL.Field((_type) => PersonCreateManyCompanyInputEnvelope, {
    nullable: true,
  })
  createMany?: PersonCreateManyCompanyInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [PersonWhereUniqueInput], {
    nullable: true,
  })
  connect?: PersonWhereUniqueInput[] | undefined;
}
