import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { RefreshTokenWhereInput } from './refresh-token-where.input';

@InputType()
export class RefreshTokenListRelationFilter {

    @Field(() => RefreshTokenWhereInput, {nullable:true})
    every?: RefreshTokenWhereInput;

    @Field(() => RefreshTokenWhereInput, {nullable:true})
    some?: RefreshTokenWhereInput;

    @Field(() => RefreshTokenWhereInput, {nullable:true})
    none?: RefreshTokenWhereInput;
}
