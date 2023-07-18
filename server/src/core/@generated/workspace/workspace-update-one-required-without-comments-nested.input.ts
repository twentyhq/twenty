import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutCommentsInput } from './workspace-create-without-comments.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateOrConnectWithoutCommentsInput } from './workspace-create-or-connect-without-comments.input';
import { WorkspaceUpsertWithoutCommentsInput } from './workspace-upsert-without-comments.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceUpdateWithoutCommentsInput } from './workspace-update-without-comments.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutCommentsNestedInput {

    @HideField()
    create?: WorkspaceCreateWithoutCommentsInput;

    @HideField()
    connectOrCreate?: WorkspaceCreateOrConnectWithoutCommentsInput;

    @HideField()
    upsert?: WorkspaceUpsertWithoutCommentsInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;

    @HideField()
    update?: WorkspaceUpdateWithoutCommentsInput;
}
