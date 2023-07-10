import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutCommentThreadInput } from './user-create-without-comment-thread.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutCommentThreadInput } from './user-create-or-connect-without-comment-thread.input';
import { UserWhereUniqueInput } from './user-where-unique.input';

@InputType()
export class UserCreateNestedOneWithoutCommentThreadInput {

    @Field(() => UserCreateWithoutCommentThreadInput, {nullable:true})
    @Type(() => UserCreateWithoutCommentThreadInput)
    create?: UserCreateWithoutCommentThreadInput;

    @Field(() => UserCreateOrConnectWithoutCommentThreadInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutCommentThreadInput)
    connectOrCreate?: UserCreateOrConnectWithoutCommentThreadInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;
}
