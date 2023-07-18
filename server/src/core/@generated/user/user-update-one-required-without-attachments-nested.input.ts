import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutAttachmentsInput } from './user-create-without-attachments.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutAttachmentsInput } from './user-create-or-connect-without-attachments.input';
import { UserUpsertWithoutAttachmentsInput } from './user-upsert-without-attachments.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { UserUpdateWithoutAttachmentsInput } from './user-update-without-attachments.input';

@InputType()
export class UserUpdateOneRequiredWithoutAttachmentsNestedInput {

    @Field(() => UserCreateWithoutAttachmentsInput, {nullable:true})
    @Type(() => UserCreateWithoutAttachmentsInput)
    create?: UserCreateWithoutAttachmentsInput;

    @Field(() => UserCreateOrConnectWithoutAttachmentsInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutAttachmentsInput)
    connectOrCreate?: UserCreateOrConnectWithoutAttachmentsInput;

    @Field(() => UserUpsertWithoutAttachmentsInput, {nullable:true})
    @Type(() => UserUpsertWithoutAttachmentsInput)
    upsert?: UserUpsertWithoutAttachmentsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @Field(() => UserUpdateWithoutAttachmentsInput, {nullable:true})
    @Type(() => UserUpdateWithoutAttachmentsInput)
    update?: UserUpdateWithoutAttachmentsInput;
}
