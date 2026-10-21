import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class SendEmailAttachmentInput {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;
}

@InputType()
export class SendEmailTargetRecordInput {
  @Field(() => String)
  objectNameSingular: string;

  @Field(() => UUIDScalarType)
  recordId: string;
}

@InputType()
export class SendEmailInput {
  @Field(() => String)
  connectedAccountId: string;

  @Field(() => String, { nullable: true })
  fromHandle?: string;

  @Field(() => String)
  to: string;

  @Field(() => String, { nullable: true })
  cc?: string;

  @Field(() => String, { nullable: true })
  bcc?: string;

  @Field(() => String)
  subject: string;

  @Field(() => String)
  body: string;

  @Field(() => String, { nullable: true })
  inReplyTo?: string;

  @Field(() => String, { nullable: true })
  draftMessageId?: string;

  @Field(() => [SendEmailAttachmentInput], { nullable: true })
  files?: SendEmailAttachmentInput[];

  @Field(() => SendEmailTargetRecordInput, { nullable: true })
  targetRecord?: SendEmailTargetRecordInput;
}
