import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { RefreshTokenWhereUniqueInput } from './refresh-token-where-unique.input';
import { Type } from 'class-transformer';
import { RefreshTokenCreateWithoutUserInput } from './refresh-token-create-without-user.input';

@InputType()
export class RefreshTokenCreateOrConnectWithoutUserInput {

    @Field(() => RefreshTokenWhereUniqueInput, {nullable:false})
    @Type(() => RefreshTokenWhereUniqueInput)
    where!: RefreshTokenWhereUniqueInput;

    @Field(() => RefreshTokenCreateWithoutUserInput, {nullable:false})
    @Type(() => RefreshTokenCreateWithoutUserInput)
    create!: RefreshTokenCreateWithoutUserInput;
}
