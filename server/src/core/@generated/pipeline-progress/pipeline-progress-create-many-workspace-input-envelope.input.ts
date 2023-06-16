import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateManyWorkspaceInput } from './pipeline-progress-create-many-workspace.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineProgressCreateManyWorkspaceInputEnvelope {

    @Field(() => [PipelineProgressCreateManyWorkspaceInput], {nullable:false})
    @Type(() => PipelineProgressCreateManyWorkspaceInput)
    data!: Array<PipelineProgressCreateManyWorkspaceInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
