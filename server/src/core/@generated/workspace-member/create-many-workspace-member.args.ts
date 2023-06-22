import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceMemberCreateManyInput } from './workspace-member-create-many.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateManyWorkspaceMemberArgs {

    @Field(() => [WorkspaceMemberCreateManyInput], {nullable:false})
    @Type(() => WorkspaceMemberCreateManyInput)
    data!: Array<WorkspaceMemberCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
