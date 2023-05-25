import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceMemberCreateOrConnectWithoutUserInput } from '../inputs/WorkspaceMemberCreateOrConnectWithoutUserInput';
import { WorkspaceMemberCreateWithoutUserInput } from '../inputs/WorkspaceMemberCreateWithoutUserInput';
import { WorkspaceMemberUpdateWithoutUserInput } from '../inputs/WorkspaceMemberUpdateWithoutUserInput';
import { WorkspaceMemberUpsertWithoutUserInput } from '../inputs/WorkspaceMemberUpsertWithoutUserInput';
import { WorkspaceMemberWhereUniqueInput } from '../inputs/WorkspaceMemberWhereUniqueInput';

@TypeGraphQL.InputType('WorkspaceMemberUpdateOneWithoutUserNestedInput', {
  isAbstract: true,
})
export class WorkspaceMemberUpdateOneWithoutUserNestedInput {
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

  @TypeGraphQL.Field((_type) => WorkspaceMemberUpsertWithoutUserInput, {
    nullable: true,
  })
  upsert?: WorkspaceMemberUpsertWithoutUserInput | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceMemberWhereUniqueInput, {
    nullable: true,
  })
  connect?: WorkspaceMemberWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceMemberUpdateWithoutUserInput, {
    nullable: true,
  })
  update?: WorkspaceMemberUpdateWithoutUserInput | undefined;
}
