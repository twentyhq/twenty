import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { BoolFieldUpdateOperationsInput } from './BoolFieldUpdateOperationsInput';
import { CompanyUpdateManyWithoutAccountOwnerNestedInput } from './CompanyUpdateManyWithoutAccountOwnerNestedInput';
import { DateTimeFieldUpdateOperationsInput } from './DateTimeFieldUpdateOperationsInput';
import { NullableDateTimeFieldUpdateOperationsInput } from './NullableDateTimeFieldUpdateOperationsInput';
import { NullableStringFieldUpdateOperationsInput } from './NullableStringFieldUpdateOperationsInput';
import { RefreshTokenUpdateManyWithoutUserNestedInput } from './RefreshTokenUpdateManyWithoutUserNestedInput';
import { StringFieldUpdateOperationsInput } from './StringFieldUpdateOperationsInput';
import { WorkspaceMemberUpdateOneWithoutUserNestedInput } from './WorkspaceMemberUpdateOneWithoutUserNestedInput';

@TypeGraphQL.InputType('UserUpdateInput', {
  isAbstract: true,
})
export class UserUpdateInput {
  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  id?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  createdAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  deletedAt?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  lastSeen?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => BoolFieldUpdateOperationsInput, {
    nullable: true,
  })
  disabled?: BoolFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  displayName?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  email?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  avatarUrl?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  locale?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  phoneNumber?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
  })
  passwordHash?: NullableStringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => BoolFieldUpdateOperationsInput, {
    nullable: true,
  })
  emailVerified?: BoolFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  metadata?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field(
    (_type) => WorkspaceMemberUpdateOneWithoutUserNestedInput,
    {
      nullable: true,
    },
  )
  WorkspaceMember?: WorkspaceMemberUpdateOneWithoutUserNestedInput | undefined;

  @TypeGraphQL.Field(
    (_type) => CompanyUpdateManyWithoutAccountOwnerNestedInput,
    {
      nullable: true,
    },
  )
  companies?: CompanyUpdateManyWithoutAccountOwnerNestedInput | undefined;

  @TypeGraphQL.Field((_type) => RefreshTokenUpdateManyWithoutUserNestedInput, {
    nullable: true,
  })
  RefreshTokens?: RefreshTokenUpdateManyWithoutUserNestedInput | undefined;
}
