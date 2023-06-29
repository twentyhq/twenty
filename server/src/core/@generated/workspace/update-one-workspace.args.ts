import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceUpdateInput } from './workspace-update.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';

@ArgsType()
export class UpdateOneWorkspaceArgs {

    @Field(() => WorkspaceUpdateInput, {nullable:false})
    @Type(() => WorkspaceUpdateInput)
    @ValidateNested({each: true})
    @Type(() => WorkspaceUpdateInput)
    data!: WorkspaceUpdateInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:false})
    @Type(() => WorkspaceWhereUniqueInput)
    where!: WorkspaceWhereUniqueInput;
}
