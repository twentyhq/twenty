import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutRefreshTokensInput } from './user-create-without-refresh-tokens.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutRefreshTokensInput } from './user-create-or-connect-without-refresh-tokens.input';
import { UserUpsertWithoutRefreshTokensInput } from './user-upsert-without-refresh-tokens.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserUpdateWithoutRefreshTokensInput } from './user-update-without-refresh-tokens.input';

@InputType()
export class UserUpdateOneRequiredWithoutRefreshTokensNestedInput {

    @HideField()
    create?: UserCreateWithoutRefreshTokensInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutRefreshTokensInput;

    @HideField()
    upsert?: UserUpsertWithoutRefreshTokensInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @HideField()
    update?: UserUpdateWithoutRefreshTokensInput;
}
