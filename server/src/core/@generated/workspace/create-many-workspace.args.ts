import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceCreateManyInput } from './workspace-create-many.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateManyWorkspaceArgs {

    @Field(() => [WorkspaceCreateManyInput], {nullable:false})
    @Type(() => WorkspaceCreateManyInput)
    @ValidateNested({each: true})
    @Type(() => WorkspaceCreateManyInput)
    data!: Array<WorkspaceCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
