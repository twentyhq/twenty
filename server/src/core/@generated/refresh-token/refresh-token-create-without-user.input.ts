import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';

@InputType()
export class RefreshTokenCreateWithoutUserInput {

    @Field(() => String, {nullable:true})
    id?: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Boolean, {nullable:true})
    isRevoked?: boolean;

    @Field(() => Date, {nullable:false})
    expiresAt!: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;
}
