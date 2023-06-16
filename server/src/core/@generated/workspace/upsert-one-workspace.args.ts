import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateInput } from './workspace-create.input';
import { WorkspaceUpdateInput } from './workspace-update.input';

@ArgsType()
export class UpsertOneWorkspaceArgs {

    @Field(() => WorkspaceWhereUniqueInput, {nullable:false})
    @Type(() => WorkspaceWhereUniqueInput)
    where!: WorkspaceWhereUniqueInput;

    @Field(() => WorkspaceCreateInput, {nullable:false})
    @Type(() => WorkspaceCreateInput)
    create!: WorkspaceCreateInput;

    @Field(() => WorkspaceUpdateInput, {nullable:false})
    @Type(() => WorkspaceUpdateInput)
    update!: WorkspaceUpdateInput;
}
