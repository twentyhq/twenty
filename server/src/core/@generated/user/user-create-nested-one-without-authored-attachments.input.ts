import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutAuthoredAttachmentsInput } from './user-create-without-authored-attachments.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutAuthoredAttachmentsInput } from './user-create-or-connect-without-authored-attachments.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class UserCreateNestedOneWithoutAuthoredAttachmentsInput {

    @HideField()
    create?: UserCreateWithoutAuthoredAttachmentsInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutAuthoredAttachmentsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;
}
