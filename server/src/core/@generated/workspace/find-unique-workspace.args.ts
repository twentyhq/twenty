import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';

@ArgsType()
export class FindUniqueWorkspaceArgs {

    @Field(() => WorkspaceWhereUniqueInput, {nullable:false})
    @Type(() => WorkspaceWhereUniqueInput)
    where!: WorkspaceWhereUniqueInput;
}
