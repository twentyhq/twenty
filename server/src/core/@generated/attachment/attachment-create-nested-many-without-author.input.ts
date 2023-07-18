import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentCreateWithoutAuthorInput } from './attachment-create-without-author.input';
import { Type } from 'class-transformer';
import { AttachmentCreateOrConnectWithoutAuthorInput } from './attachment-create-or-connect-without-author.input';
import { AttachmentCreateManyAuthorInputEnvelope } from './attachment-create-many-author-input-envelope.input';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';

@InputType()
export class AttachmentCreateNestedManyWithoutAuthorInput {

    @Field(() => [AttachmentCreateWithoutAuthorInput], {nullable:true})
    @Type(() => AttachmentCreateWithoutAuthorInput)
    create?: Array<AttachmentCreateWithoutAuthorInput>;

    @Field(() => [AttachmentCreateOrConnectWithoutAuthorInput], {nullable:true})
    @Type(() => AttachmentCreateOrConnectWithoutAuthorInput)
    connectOrCreate?: Array<AttachmentCreateOrConnectWithoutAuthorInput>;

    @Field(() => AttachmentCreateManyAuthorInputEnvelope, {nullable:true})
    @Type(() => AttachmentCreateManyAuthorInputEnvelope)
    createMany?: AttachmentCreateManyAuthorInputEnvelope;

    @Field(() => [AttachmentWhereUniqueInput], {nullable:true})
    @Type(() => AttachmentWhereUniqueInput)
    connect?: Array<AttachmentWhereUniqueInput>;
}
