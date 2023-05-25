import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PersonScalarWhereInput } from '../inputs/PersonScalarWhereInput';
import { PersonUpdateManyMutationInput } from '../inputs/PersonUpdateManyMutationInput';

@TypeGraphQL.InputType('PersonUpdateManyWithWhereWithoutWorkspaceInput', {
  isAbstract: true,
})
export class PersonUpdateManyWithWhereWithoutWorkspaceInput {
  @TypeGraphQL.Field((_type) => PersonScalarWhereInput, {
    nullable: false,
  })
  where!: PersonScalarWhereInput;

  @TypeGraphQL.Field((_type) => PersonUpdateManyMutationInput, {
    nullable: false,
  })
  data!: PersonUpdateManyMutationInput;
}
