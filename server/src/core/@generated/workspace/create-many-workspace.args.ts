import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceCreateManyInput } from './workspace-create-many.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateManyWorkspaceArgs {

    @Field(() => [WorkspaceCreateManyInput], {nullable:false})
    @Type(() => WorkspaceCreateManyInput)
    @Type(() => WorkspaceCreateManyInput)
    @ValidateNested({each: true})
    data!: Array<WorkspaceCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
