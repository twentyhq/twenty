import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentType } from './attachment-type.enum';

@InputType()
export class EnumAttachmentTypeFieldUpdateOperationsInput {

    @Field(() => AttachmentType, {nullable:true})
    set?: keyof typeof AttachmentType;
}
