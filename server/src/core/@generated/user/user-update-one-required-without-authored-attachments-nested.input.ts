import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutAuthoredAttachmentsInput } from './user-create-without-authored-attachments.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutAuthoredAttachmentsInput } from './user-create-or-connect-without-authored-attachments.input';
import { UserUpsertWithoutAuthoredAttachmentsInput } from './user-upsert-without-authored-attachments.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserUpdateWithoutAuthoredAttachmentsInput } from './user-update-without-authored-attachments.input';

@InputType()
export class UserUpdateOneRequiredWithoutAuthoredAttachmentsNestedInput {

    @HideField()
    create?: UserCreateWithoutAuthoredAttachmentsInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutAuthoredAttachmentsInput;

    @HideField()
    upsert?: UserUpsertWithoutAuthoredAttachmentsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @HideField()
    update?: UserUpdateWithoutAuthoredAttachmentsInput;
}
