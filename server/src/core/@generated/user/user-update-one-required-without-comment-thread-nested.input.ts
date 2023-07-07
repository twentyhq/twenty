import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutCommentThreadInput } from './user-create-without-comment-thread.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutCommentThreadInput } from './user-create-or-connect-without-comment-thread.input';
import { UserUpsertWithoutCommentThreadInput } from './user-upsert-without-comment-thread.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { UserUpdateWithoutCommentThreadInput } from './user-update-without-comment-thread.input';

@InputType()
export class UserUpdateOneRequiredWithoutCommentThreadNestedInput {

    @Field(() => UserCreateWithoutCommentThreadInput, {nullable:true})
    @Type(() => UserCreateWithoutCommentThreadInput)
    create?: UserCreateWithoutCommentThreadInput;

    @Field(() => UserCreateOrConnectWithoutCommentThreadInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutCommentThreadInput)
    connectOrCreate?: UserCreateOrConnectWithoutCommentThreadInput;

    @Field(() => UserUpsertWithoutCommentThreadInput, {nullable:true})
    @Type(() => UserUpsertWithoutCommentThreadInput)
    upsert?: UserUpsertWithoutCommentThreadInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @Field(() => UserUpdateWithoutCommentThreadInput, {nullable:true})
    @Type(() => UserUpdateWithoutCommentThreadInput)
    update?: UserUpdateWithoutCommentThreadInput;
}
