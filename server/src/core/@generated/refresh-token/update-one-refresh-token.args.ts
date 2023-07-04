import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { RefreshTokenUpdateInput } from './refresh-token-update.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { RefreshTokenWhereUniqueInput } from './refresh-token-where-unique.input';

@ArgsType()
export class UpdateOneRefreshTokenArgs {

    @Field(() => RefreshTokenUpdateInput, {nullable:false})
    @Type(() => RefreshTokenUpdateInput)
    @Type(() => RefreshTokenUpdateInput)
    @ValidateNested({each: true})
    data!: RefreshTokenUpdateInput;

    @Field(() => RefreshTokenWhereUniqueInput, {nullable:false})
    @Type(() => RefreshTokenWhereUniqueInput)
    where!: RefreshTokenWhereUniqueInput;
}
