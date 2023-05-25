import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { UserCreateWithoutWorkspaceMemberInput } from '../inputs/UserCreateWithoutWorkspaceMemberInput';
import { UserWhereUniqueInput } from '../inputs/UserWhereUniqueInput';

@TypeGraphQL.InputType('UserCreateOrConnectWithoutWorkspaceMemberInput', {
  isAbstract: true,
})
export class UserCreateOrConnectWithoutWorkspaceMemberInput {
  @TypeGraphQL.Field((_type) => UserWhereUniqueInput, {
    nullable: false,
  })
  where!: UserWhereUniqueInput;

  @TypeGraphQL.Field((_type) => UserCreateWithoutWorkspaceMemberInput, {
    nullable: false,
  })
  create!: UserCreateWithoutWorkspaceMemberInput;
}
