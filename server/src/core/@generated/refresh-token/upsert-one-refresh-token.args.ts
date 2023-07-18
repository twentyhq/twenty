import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { RefreshTokenWhereUniqueInput } from './refresh-token-where-unique.input';
import { Type } from 'class-transformer';
import { RefreshTokenCreateInput } from './refresh-token-create.input';
import { HideField } from '@nestjs/graphql';
import { RefreshTokenUpdateInput } from './refresh-token-update.input';

@ArgsType()
export class UpsertOneRefreshTokenArgs {

    @Field(() => RefreshTokenWhereUniqueInput, {nullable:false})
    @Type(() => RefreshTokenWhereUniqueInput)
    where!: RefreshTokenWhereUniqueInput;

    @HideField()
    create!: RefreshTokenCreateInput;

    @HideField()
    update!: RefreshTokenUpdateInput;
}
