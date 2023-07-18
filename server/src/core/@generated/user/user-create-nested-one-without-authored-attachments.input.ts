import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutAuthoredAttachmentsInput } from './user-create-without-authored-attachments.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutAuthoredAttachmentsInput } from './user-create-or-connect-without-authored-attachments.input';
import { UserWhereUniqueInput } from './user-where-unique.input';

@InputType()
export class UserCreateNestedOneWithoutAuthoredAttachmentsInput {

    @Field(() => UserCreateWithoutAuthoredAttachmentsInput, {nullable:true})
    @Type(() => UserCreateWithoutAuthoredAttachmentsInput)
    create?: UserCreateWithoutAuthoredAttachmentsInput;

    @Field(() => UserCreateOrConnectWithoutAuthoredAttachmentsInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutAuthoredAttachmentsInput)
    connectOrCreate?: UserCreateOrConnectWithoutAuthoredAttachmentsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;
}
