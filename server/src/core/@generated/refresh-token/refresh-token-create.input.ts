import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { UserCreateNestedOneWithoutRefreshTokensInput } from '../user/user-create-nested-one-without-refresh-tokens.input';

@InputType()
export class RefreshTokenCreateInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => Boolean, {nullable:true})
    @Validator.IsBoolean()
    @Validator.IsOptional()
    isRevoked?: boolean;

    @Field(() => Date, {nullable:false})
    expiresAt!: Date | string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @HideField()
    user!: UserCreateNestedOneWithoutRefreshTokensInput;
}
