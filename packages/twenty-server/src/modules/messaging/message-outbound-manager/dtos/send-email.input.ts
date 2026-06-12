import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SendEmailAttachmentInput {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;
}

@InputType()
export class SendEmailInput {
  @Field(() => String)
  connectedAccountId: string;

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

  @Field(() => [SendEmailAttachmentInput], { nullable: true })
  files?: SendEmailAttachmentInput[];
}
