import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { UserCreateOrConnectWithoutWorkspaceMemberInput } from './UserCreateOrConnectWithoutWorkspaceMemberInput';
import { UserCreateWithoutWorkspaceMemberInput } from './UserCreateWithoutWorkspaceMemberInput';
import { UserUpdateWithoutWorkspaceMemberInput } from './UserUpdateWithoutWorkspaceMemberInput';
import { UserUpsertWithoutWorkspaceMemberInput } from './UserUpsertWithoutWorkspaceMemberInput';
import { UserWhereUniqueInput } from './UserWhereUniqueInput';

@TypeGraphQL.InputType(
  'UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput',
  {
    isAbstract: true,
  },
)
export class UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput {
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

  @TypeGraphQL.Field((_type) => UserUpsertWithoutWorkspaceMemberInput, {
    nullable: true,
  })
  upsert?: UserUpsertWithoutWorkspaceMemberInput | undefined;

  @TypeGraphQL.Field((_type) => UserWhereUniqueInput, {
    nullable: true,
  })
  connect?: UserWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => UserUpdateWithoutWorkspaceMemberInput, {
    nullable: true,
  })
  update?: UserUpdateWithoutWorkspaceMemberInput | undefined;
}
