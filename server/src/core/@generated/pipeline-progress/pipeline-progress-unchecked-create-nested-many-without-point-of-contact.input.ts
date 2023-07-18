import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutPointOfContactInput } from './pipeline-progress-create-without-point-of-contact.input';
import { Type } from 'class-transformer';
import { PipelineProgressCreateOrConnectWithoutPointOfContactInput } from './pipeline-progress-create-or-connect-without-point-of-contact.input';
import { PipelineProgressCreateManyPointOfContactInputEnvelope } from './pipeline-progress-create-many-point-of-contact-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';

@InputType()
export class PipelineProgressUncheckedCreateNestedManyWithoutPointOfContactInput {

    @Field(() => [PipelineProgressCreateWithoutPointOfContactInput], {nullable:true})
    @Type(() => PipelineProgressCreateWithoutPointOfContactInput)
    create?: Array<PipelineProgressCreateWithoutPointOfContactInput>;

    @Field(() => [PipelineProgressCreateOrConnectWithoutPointOfContactInput], {nullable:true})
    @Type(() => PipelineProgressCreateOrConnectWithoutPointOfContactInput)
    connectOrCreate?: Array<PipelineProgressCreateOrConnectWithoutPointOfContactInput>;

    @Field(() => PipelineProgressCreateManyPointOfContactInputEnvelope, {nullable:true})
    @Type(() => PipelineProgressCreateManyPointOfContactInputEnvelope)
    createMany?: PipelineProgressCreateManyPointOfContactInputEnvelope;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    connect?: Array<PipelineProgressWhereUniqueInput>;
}
