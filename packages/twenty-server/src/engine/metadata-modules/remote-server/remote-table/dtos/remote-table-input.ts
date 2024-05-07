import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class RemoteTableInput {
  @Field(() => ID)
  remoteServerId: string;

  @Field(() => String)
  name: string;
}
