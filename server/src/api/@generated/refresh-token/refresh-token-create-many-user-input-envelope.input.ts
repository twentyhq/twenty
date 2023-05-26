import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { RefreshTokenCreateManyUserInput } from './refresh-token-create-many-user.input';
import { Type } from 'class-transformer';

@InputType()
export class RefreshTokenCreateManyUserInputEnvelope {

    @Field(() => [RefreshTokenCreateManyUserInput], {nullable:false})
    @Type(() => RefreshTokenCreateManyUserInput)
    data!: Array<RefreshTokenCreateManyUserInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
