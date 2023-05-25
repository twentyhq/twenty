import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceMemberCreateOrConnectWithoutUserInput } from './WorkspaceMemberCreateOrConnectWithoutUserInput';
import { WorkspaceMemberCreateWithoutUserInput } from './WorkspaceMemberCreateWithoutUserInput';
import { WorkspaceMemberWhereUniqueInput } from './WorkspaceMemberWhereUniqueInput';

@TypeGraphQL.InputType('WorkspaceMemberCreateNestedOneWithoutUserInput', {
  isAbstract: true,
})
export class WorkspaceMemberCreateNestedOneWithoutUserInput {
  @TypeGraphQL.Field((_type) => WorkspaceMemberCreateWithoutUserInput, {
    nullable: true,
  })
  create?: WorkspaceMemberCreateWithoutUserInput | undefined;

  @TypeGraphQL.Field(
    (_type) => WorkspaceMemberCreateOrConnectWithoutUserInput,
    {
      nullable: true,
    },
  )
  connectOrCreate?: WorkspaceMemberCreateOrConnectWithoutUserInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceMemberWhereUniqueInput, {
    nullable: true,
  })
  connect?: WorkspaceMemberWhereUniqueInput | undefined;
}
