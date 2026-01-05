import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WhatsappConnectionStatusDTO {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  connectedAccountId: string;
}
