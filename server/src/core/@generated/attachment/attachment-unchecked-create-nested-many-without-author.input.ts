import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentCreateWithoutAuthorInput } from './attachment-create-without-author.input';
import { HideField } from '@nestjs/graphql';
import { AttachmentCreateOrConnectWithoutAuthorInput } from './attachment-create-or-connect-without-author.input';
import { AttachmentCreateManyAuthorInputEnvelope } from './attachment-create-many-author-input-envelope.input';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class AttachmentUncheckedCreateNestedManyWithoutAuthorInput {

    @HideField()
    create?: Array<AttachmentCreateWithoutAuthorInput>;

    @HideField()
    connectOrCreate?: Array<AttachmentCreateOrConnectWithoutAuthorInput>;

    @HideField()
    createMany?: AttachmentCreateManyAuthorInputEnvelope;

    @Field(() => [AttachmentWhereUniqueInput], {nullable:true})
    @Type(() => AttachmentWhereUniqueInput)
    connect?: Array<AttachmentWhereUniqueInput>;
}
