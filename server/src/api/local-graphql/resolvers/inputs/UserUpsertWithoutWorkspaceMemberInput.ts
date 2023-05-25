import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { UserCreateWithoutWorkspaceMemberInput } from './UserCreateWithoutWorkspaceMemberInput';
import { UserUpdateWithoutWorkspaceMemberInput } from './UserUpdateWithoutWorkspaceMemberInput';

@TypeGraphQL.InputType('UserUpsertWithoutWorkspaceMemberInput', {
  isAbstract: true,
})
export class UserUpsertWithoutWorkspaceMemberInput {
  @TypeGraphQL.Field((_type) => UserUpdateWithoutWorkspaceMemberInput, {
    nullable: false,
  })
  update!: UserUpdateWithoutWorkspaceMemberInput;

  @TypeGraphQL.Field((_type) => UserCreateWithoutWorkspaceMemberInput, {
    nullable: false,
  })
  create!: UserCreateWithoutWorkspaceMemberInput;
}
