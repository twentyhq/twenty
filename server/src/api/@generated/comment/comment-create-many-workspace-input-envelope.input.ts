import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateManyWorkspaceInput } from './comment-create-many-workspace.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentCreateManyWorkspaceInputEnvelope {

    @Field(() => [CommentCreateManyWorkspaceInput], {nullable:false})
    @Type(() => CommentCreateManyWorkspaceInput)
    data!: Array<CommentCreateManyWorkspaceInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
