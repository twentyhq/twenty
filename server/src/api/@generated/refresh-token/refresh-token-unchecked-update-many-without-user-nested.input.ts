import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { RefreshTokenCreateWithoutUserInput } from './refresh-token-create-without-user.input';
import { Type } from 'class-transformer';
import { RefreshTokenCreateOrConnectWithoutUserInput } from './refresh-token-create-or-connect-without-user.input';
import { RefreshTokenUpsertWithWhereUniqueWithoutUserInput } from './refresh-token-upsert-with-where-unique-without-user.input';
import { RefreshTokenCreateManyUserInputEnvelope } from './refresh-token-create-many-user-input-envelope.input';
import { RefreshTokenWhereUniqueInput } from './refresh-token-where-unique.input';
import { RefreshTokenUpdateWithWhereUniqueWithoutUserInput } from './refresh-token-update-with-where-unique-without-user.input';
import { RefreshTokenUpdateManyWithWhereWithoutUserInput } from './refresh-token-update-many-with-where-without-user.input';
import { RefreshTokenScalarWhereInput } from './refresh-token-scalar-where.input';

@InputType()
export class RefreshTokenUncheckedUpdateManyWithoutUserNestedInput {

    @Field(() => [RefreshTokenCreateWithoutUserInput], {nullable:true})
    @Type(() => RefreshTokenCreateWithoutUserInput)
    create?: Array<RefreshTokenCreateWithoutUserInput>;

    @Field(() => [RefreshTokenCreateOrConnectWithoutUserInput], {nullable:true})
    @Type(() => RefreshTokenCreateOrConnectWithoutUserInput)
    connectOrCreate?: Array<RefreshTokenCreateOrConnectWithoutUserInput>;

    @Field(() => [RefreshTokenUpsertWithWhereUniqueWithoutUserInput], {nullable:true})
    @Type(() => RefreshTokenUpsertWithWhereUniqueWithoutUserInput)
    upsert?: Array<RefreshTokenUpsertWithWhereUniqueWithoutUserInput>;

    @Field(() => RefreshTokenCreateManyUserInputEnvelope, {nullable:true})
    @Type(() => RefreshTokenCreateManyUserInputEnvelope)
    createMany?: RefreshTokenCreateManyUserInputEnvelope;

    @Field(() => [RefreshTokenWhereUniqueInput], {nullable:true})
    @Type(() => RefreshTokenWhereUniqueInput)
    set?: Array<RefreshTokenWhereUniqueInput>;

    @Field(() => [RefreshTokenWhereUniqueInput], {nullable:true})
    @Type(() => RefreshTokenWhereUniqueInput)
    disconnect?: Array<RefreshTokenWhereUniqueInput>;

    @Field(() => [RefreshTokenWhereUniqueInput], {nullable:true})
    @Type(() => RefreshTokenWhereUniqueInput)
    delete?: Array<RefreshTokenWhereUniqueInput>;

    @Field(() => [RefreshTokenWhereUniqueInput], {nullable:true})
    @Type(() => RefreshTokenWhereUniqueInput)
    connect?: Array<RefreshTokenWhereUniqueInput>;

    @Field(() => [RefreshTokenUpdateWithWhereUniqueWithoutUserInput], {nullable:true})
    @Type(() => RefreshTokenUpdateWithWhereUniqueWithoutUserInput)
    update?: Array<RefreshTokenUpdateWithWhereUniqueWithoutUserInput>;

    @Field(() => [RefreshTokenUpdateManyWithWhereWithoutUserInput], {nullable:true})
    @Type(() => RefreshTokenUpdateManyWithWhereWithoutUserInput)
    updateMany?: Array<RefreshTokenUpdateManyWithWhereWithoutUserInput>;

    @Field(() => [RefreshTokenScalarWhereInput], {nullable:true})
    @Type(() => RefreshTokenScalarWhereInput)
    deleteMany?: Array<RefreshTokenScalarWhereInput>;
}
