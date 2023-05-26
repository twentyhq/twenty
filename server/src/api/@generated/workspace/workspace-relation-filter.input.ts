import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceWhereInput } from './workspace-where.input';

@InputType()
export class WorkspaceRelationFilter {

    @Field(() => WorkspaceWhereInput, {nullable:true})
    is?: WorkspaceWhereInput;

    @Field(() => WorkspaceWhereInput, {nullable:true})
    isNot?: WorkspaceWhereInput;
}
