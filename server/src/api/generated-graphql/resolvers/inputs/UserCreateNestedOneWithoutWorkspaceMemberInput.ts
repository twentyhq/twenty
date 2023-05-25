import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { UserCreateOrConnectWithoutWorkspaceMemberInput } from './UserCreateOrConnectWithoutWorkspaceMemberInput';
import { UserCreateWithoutWorkspaceMemberInput } from './UserCreateWithoutWorkspaceMemberInput';
import { UserWhereUniqueInput } from './UserWhereUniqueInput';

@TypeGraphQL.InputType('UserCreateNestedOneWithoutWorkspaceMemberInput', {
  isAbstract: true,
})
export class UserCreateNestedOneWithoutWorkspaceMemberInput {
  @TypeGraphQL.Field((_type) => UserCreateWithoutWorkspaceMemberInput, {
    nullable: true,
  })
  create?: UserCreateWithoutWorkspaceMemberInput | undefined;

  @TypeGraphQL.Field(
    (_type) => UserCreateOrConnectWithoutWorkspaceMemberInput,
    {
      nullable: true,
    },
  )
  connectOrCreate?: UserCreateOrConnectWithoutWorkspaceMemberInput | undefined;

  @TypeGraphQL.Field((_type) => UserWhereUniqueInput, {
    nullable: true,
  })
  connect?: UserWhereUniqueInput | undefined;
}
