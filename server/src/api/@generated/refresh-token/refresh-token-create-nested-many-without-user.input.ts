import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { RefreshTokenCreateWithoutUserInput } from './refresh-token-create-without-user.input';
import { Type } from 'class-transformer';
import { RefreshTokenCreateOrConnectWithoutUserInput } from './refresh-token-create-or-connect-without-user.input';
import { RefreshTokenCreateManyUserInputEnvelope } from './refresh-token-create-many-user-input-envelope.input';
import { RefreshTokenWhereUniqueInput } from './refresh-token-where-unique.input';

@InputType()
export class RefreshTokenCreateNestedManyWithoutUserInput {

    @Field(() => [RefreshTokenCreateWithoutUserInput], {nullable:true})
    @Type(() => RefreshTokenCreateWithoutUserInput)
    create?: Array<RefreshTokenCreateWithoutUserInput>;

    @Field(() => [RefreshTokenCreateOrConnectWithoutUserInput], {nullable:true})
    @Type(() => RefreshTokenCreateOrConnectWithoutUserInput)
    connectOrCreate?: Array<RefreshTokenCreateOrConnectWithoutUserInput>;

    @Field(() => RefreshTokenCreateManyUserInputEnvelope, {nullable:true})
    @Type(() => RefreshTokenCreateManyUserInputEnvelope)
    createMany?: RefreshTokenCreateManyUserInputEnvelope;

    @Field(() => [RefreshTokenWhereUniqueInput], {nullable:true})
    @Type(() => RefreshTokenWhereUniqueInput)
    connect?: Array<RefreshTokenWhereUniqueInput>;
}
