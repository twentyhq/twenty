import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutPointOfContactInput } from './pipeline-progress-create-without-point-of-contact.input';
import { Type } from 'class-transformer';
import { PipelineProgressCreateOrConnectWithoutPointOfContactInput } from './pipeline-progress-create-or-connect-without-point-of-contact.input';
import { PipelineProgressUpsertWithWhereUniqueWithoutPointOfContactInput } from './pipeline-progress-upsert-with-where-unique-without-point-of-contact.input';
import { PipelineProgressCreateManyPointOfContactInputEnvelope } from './pipeline-progress-create-many-point-of-contact-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { PipelineProgressUpdateWithWhereUniqueWithoutPointOfContactInput } from './pipeline-progress-update-with-where-unique-without-point-of-contact.input';
import { PipelineProgressUpdateManyWithWhereWithoutPointOfContactInput } from './pipeline-progress-update-many-with-where-without-point-of-contact.input';
import { PipelineProgressScalarWhereInput } from './pipeline-progress-scalar-where.input';

@InputType()
export class PipelineProgressUncheckedUpdateManyWithoutPointOfContactNestedInput {

    @Field(() => [PipelineProgressCreateWithoutPointOfContactInput], {nullable:true})
    @Type(() => PipelineProgressCreateWithoutPointOfContactInput)
    create?: Array<PipelineProgressCreateWithoutPointOfContactInput>;

    @Field(() => [PipelineProgressCreateOrConnectWithoutPointOfContactInput], {nullable:true})
    @Type(() => PipelineProgressCreateOrConnectWithoutPointOfContactInput)
    connectOrCreate?: Array<PipelineProgressCreateOrConnectWithoutPointOfContactInput>;

    @Field(() => [PipelineProgressUpsertWithWhereUniqueWithoutPointOfContactInput], {nullable:true})
    @Type(() => PipelineProgressUpsertWithWhereUniqueWithoutPointOfContactInput)
    upsert?: Array<PipelineProgressUpsertWithWhereUniqueWithoutPointOfContactInput>;

    @Field(() => PipelineProgressCreateManyPointOfContactInputEnvelope, {nullable:true})
    @Type(() => PipelineProgressCreateManyPointOfContactInputEnvelope)
    createMany?: PipelineProgressCreateManyPointOfContactInputEnvelope;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    set?: Array<PipelineProgressWhereUniqueInput>;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    disconnect?: Array<PipelineProgressWhereUniqueInput>;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    delete?: Array<PipelineProgressWhereUniqueInput>;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    connect?: Array<PipelineProgressWhereUniqueInput>;

    @Field(() => [PipelineProgressUpdateWithWhereUniqueWithoutPointOfContactInput], {nullable:true})
    @Type(() => PipelineProgressUpdateWithWhereUniqueWithoutPointOfContactInput)
    update?: Array<PipelineProgressUpdateWithWhereUniqueWithoutPointOfContactInput>;

    @Field(() => [PipelineProgressUpdateManyWithWhereWithoutPointOfContactInput], {nullable:true})
    @Type(() => PipelineProgressUpdateManyWithWhereWithoutPointOfContactInput)
    updateMany?: Array<PipelineProgressUpdateManyWithWhereWithoutPointOfContactInput>;

    @Field(() => [PipelineProgressScalarWhereInput], {nullable:true})
    @Type(() => PipelineProgressScalarWhereInput)
    deleteMany?: Array<PipelineProgressScalarWhereInput>;
}
