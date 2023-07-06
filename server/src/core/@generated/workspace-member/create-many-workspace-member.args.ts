import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceMemberCreateManyInput } from './workspace-member-create-many.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateManyWorkspaceMemberArgs {

    @Field(() => [WorkspaceMemberCreateManyInput], {nullable:false})
    @Type(() => WorkspaceMemberCreateManyInput)
    @Type(() => WorkspaceMemberCreateManyInput)
    @ValidateNested({each: true})
    data!: Array<WorkspaceMemberCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
