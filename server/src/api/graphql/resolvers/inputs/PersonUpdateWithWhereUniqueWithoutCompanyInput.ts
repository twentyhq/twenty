import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PersonUpdateWithoutCompanyInput } from '../inputs/PersonUpdateWithoutCompanyInput';
import { PersonWhereUniqueInput } from '../inputs/PersonWhereUniqueInput';

@TypeGraphQL.InputType('PersonUpdateWithWhereUniqueWithoutCompanyInput', {
  isAbstract: true,
})
export class PersonUpdateWithWhereUniqueWithoutCompanyInput {
  @TypeGraphQL.Field((_type) => PersonWhereUniqueInput, {
    nullable: false,
  })
  where!: PersonWhereUniqueInput;

  @TypeGraphQL.Field((_type) => PersonUpdateWithoutCompanyInput, {
    nullable: false,
  })
  data!: PersonUpdateWithoutCompanyInput;
}
