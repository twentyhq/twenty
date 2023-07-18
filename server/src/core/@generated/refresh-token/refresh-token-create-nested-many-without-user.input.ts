import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { RefreshTokenCreateWithoutUserInput } from './refresh-token-create-without-user.input';
import { HideField } from '@nestjs/graphql';
import { RefreshTokenCreateOrConnectWithoutUserInput } from './refresh-token-create-or-connect-without-user.input';
import { RefreshTokenCreateManyUserInputEnvelope } from './refresh-token-create-many-user-input-envelope.input';
import { RefreshTokenWhereUniqueInput } from './refresh-token-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class RefreshTokenCreateNestedManyWithoutUserInput {

    @HideField()
    create?: Array<RefreshTokenCreateWithoutUserInput>;

    @HideField()
    connectOrCreate?: Array<RefreshTokenCreateOrConnectWithoutUserInput>;

    @HideField()
    createMany?: RefreshTokenCreateManyUserInputEnvelope;

    @Field(() => [RefreshTokenWhereUniqueInput], {nullable:true})
    @Type(() => RefreshTokenWhereUniqueInput)
    connect?: Array<RefreshTokenWhereUniqueInput>;
}
