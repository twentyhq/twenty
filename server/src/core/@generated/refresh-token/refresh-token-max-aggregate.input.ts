import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';

@InputType()
export class RefreshTokenMaxAggregateInput {

    @Field(() => Boolean, {nullable:true})
    id?: true;

    @Field(() => Boolean, {nullable:true})
    createdAt?: true;

    @Field(() => Boolean, {nullable:true})
    updatedAt?: true;

    @Field(() => Boolean, {nullable:true})
    deletedAt?: true;

    @Field(() => Boolean, {nullable:true})
    refreshToken?: true;

    @Field(() => Boolean, {nullable:true})
    userId?: true;
}
