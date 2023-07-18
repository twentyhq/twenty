import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutAttachmentsInput } from './user-create-without-attachments.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutAttachmentsInput } from './user-create-or-connect-without-attachments.input';
import { UserWhereUniqueInput } from './user-where-unique.input';

@InputType()
export class UserCreateNestedOneWithoutAttachmentsInput {

    @Field(() => UserCreateWithoutAttachmentsInput, {nullable:true})
    @Type(() => UserCreateWithoutAttachmentsInput)
    create?: UserCreateWithoutAttachmentsInput;

    @Field(() => UserCreateOrConnectWithoutAttachmentsInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutAttachmentsInput)
    connectOrCreate?: UserCreateOrConnectWithoutAttachmentsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;
}
