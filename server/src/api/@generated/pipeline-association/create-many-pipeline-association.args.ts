import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineAssociationCreateManyInput } from './pipeline-association-create-many.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateManyPipelineAssociationArgs {
  @Field(() => [PipelineAssociationCreateManyInput], { nullable: false })
  @Type(() => PipelineAssociationCreateManyInput)
  data!: Array<PipelineAssociationCreateManyInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
