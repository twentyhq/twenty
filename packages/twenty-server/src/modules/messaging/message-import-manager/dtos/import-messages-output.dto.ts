import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ImportedMessage')
export class ImportedMessageDTO {
  @Field(() => String)
  externalId: string;

  @Field(() => String)
  messageId: string;

  @Field(() => String)
  messageThreadId: string;
}

@ObjectType('ImportMessagesOutput')
export class ImportMessagesOutputDTO {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => [ImportedMessageDTO], { nullable: true })
  importedMessages?: ImportedMessageDTO[];
}
