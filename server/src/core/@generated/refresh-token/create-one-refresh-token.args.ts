import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { RefreshTokenCreateInput } from './refresh-token-create.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateOneRefreshTokenArgs {

    @Field(() => RefreshTokenCreateInput, {nullable:false})
    @Type(() => RefreshTokenCreateInput)
    @ValidateNested({each: true})
    @Type(() => RefreshTokenCreateInput)
    data!: RefreshTokenCreateInput;
}
