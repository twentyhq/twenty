import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PersonCreateWithoutWorkspaceInput } from './PersonCreateWithoutWorkspaceInput';
import { PersonWhereUniqueInput } from './PersonWhereUniqueInput';

@TypeGraphQL.InputType('PersonCreateOrConnectWithoutWorkspaceInput', {
  isAbstract: true,
})
export class PersonCreateOrConnectWithoutWorkspaceInput {
  @TypeGraphQL.Field((_type) => PersonWhereUniqueInput, {
    nullable: false,
  })
  where!: PersonWhereUniqueInput;

  @TypeGraphQL.Field((_type) => PersonCreateWithoutWorkspaceInput, {
    nullable: false,
  })
  create!: PersonCreateWithoutWorkspaceInput;
}
