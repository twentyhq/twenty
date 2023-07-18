import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { RefreshTokenCreateWithoutUserInput } from './refresh-token-create-without-user.input';
import { HideField } from '@nestjs/graphql';
import { RefreshTokenCreateOrConnectWithoutUserInput } from './refresh-token-create-or-connect-without-user.input';
import { RefreshTokenUpsertWithWhereUniqueWithoutUserInput } from './refresh-token-upsert-with-where-unique-without-user.input';
import { RefreshTokenCreateManyUserInputEnvelope } from './refresh-token-create-many-user-input-envelope.input';
import { RefreshTokenWhereUniqueInput } from './refresh-token-where-unique.input';
import { Type } from 'class-transformer';
import { RefreshTokenUpdateWithWhereUniqueWithoutUserInput } from './refresh-token-update-with-where-unique-without-user.input';
import { RefreshTokenUpdateManyWithWhereWithoutUserInput } from './refresh-token-update-many-with-where-without-user.input';
import { RefreshTokenScalarWhereInput } from './refresh-token-scalar-where.input';

@InputType()
export class RefreshTokenUpdateManyWithoutUserNestedInput {

    @HideField()
    create?: Array<RefreshTokenCreateWithoutUserInput>;

    @HideField()
    connectOrCreate?: Array<RefreshTokenCreateOrConnectWithoutUserInput>;

    @HideField()
    upsert?: Array<RefreshTokenUpsertWithWhereUniqueWithoutUserInput>;

    @HideField()
    createMany?: RefreshTokenCreateManyUserInputEnvelope;

    @Field(() => [RefreshTokenWhereUniqueInput], {nullable:true})
    @Type(() => RefreshTokenWhereUniqueInput)
    set?: Array<RefreshTokenWhereUniqueInput>;

    @Field(() => [RefreshTokenWhereUniqueInput], {nullable:true})
    @Type(() => RefreshTokenWhereUniqueInput)
    disconnect?: Array<RefreshTokenWhereUniqueInput>;

    @HideField()
    delete?: Array<RefreshTokenWhereUniqueInput>;

    @Field(() => [RefreshTokenWhereUniqueInput], {nullable:true})
    @Type(() => RefreshTokenWhereUniqueInput)
    connect?: Array<RefreshTokenWhereUniqueInput>;

    @HideField()
    update?: Array<RefreshTokenUpdateWithWhereUniqueWithoutUserInput>;

    @HideField()
    updateMany?: Array<RefreshTokenUpdateManyWithWhereWithoutUserInput>;

    @HideField()
    deleteMany?: Array<RefreshTokenScalarWhereInput>;
}
