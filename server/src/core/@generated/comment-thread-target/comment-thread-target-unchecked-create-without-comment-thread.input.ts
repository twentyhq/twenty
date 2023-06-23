import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentableType } from '../prisma/commentable-type.enum';

@InputType()
export class CommentThreadTargetUncheckedCreateWithoutCommentThreadInput {

    @Field(() => String, {nullable:true})
    id?: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => CommentableType, {nullable:false})
    commentableType!: keyof typeof CommentableType;

    @Field(() => String, {nullable:false})
    commentableId!: string;
}
