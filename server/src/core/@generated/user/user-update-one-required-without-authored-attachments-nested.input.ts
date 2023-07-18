import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutAuthoredAttachmentsInput } from './user-create-without-authored-attachments.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutAuthoredAttachmentsInput } from './user-create-or-connect-without-authored-attachments.input';
import { UserUpsertWithoutAuthoredAttachmentsInput } from './user-upsert-without-authored-attachments.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { UserUpdateWithoutAuthoredAttachmentsInput } from './user-update-without-authored-attachments.input';

@InputType()
export class UserUpdateOneRequiredWithoutAuthoredAttachmentsNestedInput {

    @Field(() => UserCreateWithoutAuthoredAttachmentsInput, {nullable:true})
    @Type(() => UserCreateWithoutAuthoredAttachmentsInput)
    create?: UserCreateWithoutAuthoredAttachmentsInput;

    @Field(() => UserCreateOrConnectWithoutAuthoredAttachmentsInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutAuthoredAttachmentsInput)
    connectOrCreate?: UserCreateOrConnectWithoutAuthoredAttachmentsInput;

    @Field(() => UserUpsertWithoutAuthoredAttachmentsInput, {nullable:true})
    @Type(() => UserUpsertWithoutAuthoredAttachmentsInput)
    upsert?: UserUpsertWithoutAuthoredAttachmentsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @Field(() => UserUpdateWithoutAuthoredAttachmentsInput, {nullable:true})
    @Type(() => UserUpdateWithoutAuthoredAttachmentsInput)
    update?: UserUpdateWithoutAuthoredAttachmentsInput;
}
