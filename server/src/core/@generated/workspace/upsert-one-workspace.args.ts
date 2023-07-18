import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateInput } from './workspace-create.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceUpdateInput } from './workspace-update.input';

@ArgsType()
export class UpsertOneWorkspaceArgs {

    @Field(() => WorkspaceWhereUniqueInput, {nullable:false})
    @Type(() => WorkspaceWhereUniqueInput)
    where!: WorkspaceWhereUniqueInput;

    @HideField()
    create!: WorkspaceCreateInput;

    @HideField()
    update!: WorkspaceUpdateInput;
}
