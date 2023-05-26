import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { RefreshTokenWhereUniqueInput } from './refresh-token-where-unique.input';
import { Type } from 'class-transformer';
import { RefreshTokenUpdateWithoutUserInput } from './refresh-token-update-without-user.input';
import { RefreshTokenCreateWithoutUserInput } from './refresh-token-create-without-user.input';

@InputType()
export class RefreshTokenUpsertWithWhereUniqueWithoutUserInput {

    @Field(() => RefreshTokenWhereUniqueInput, {nullable:false})
    @Type(() => RefreshTokenWhereUniqueInput)
    where!: RefreshTokenWhereUniqueInput;

    @Field(() => RefreshTokenUpdateWithoutUserInput, {nullable:false})
    @Type(() => RefreshTokenUpdateWithoutUserInput)
    update!: RefreshTokenUpdateWithoutUserInput;

    @Field(() => RefreshTokenCreateWithoutUserInput, {nullable:false})
    @Type(() => RefreshTokenCreateWithoutUserInput)
    create!: RefreshTokenCreateWithoutUserInput;
}
