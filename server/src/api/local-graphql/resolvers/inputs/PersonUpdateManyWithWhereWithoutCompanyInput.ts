import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PersonScalarWhereInput } from './PersonScalarWhereInput';
import { PersonUpdateManyMutationInput } from './PersonUpdateManyMutationInput';

@TypeGraphQL.InputType('PersonUpdateManyWithWhereWithoutCompanyInput', {
  isAbstract: true,
})
export class PersonUpdateManyWithWhereWithoutCompanyInput {
  @TypeGraphQL.Field((_type) => PersonScalarWhereInput, {
    nullable: false,
  })
  where!: PersonScalarWhereInput;

  @TypeGraphQL.Field((_type) => PersonUpdateManyMutationInput, {
    nullable: false,
  })
  data!: PersonUpdateManyMutationInput;
}
