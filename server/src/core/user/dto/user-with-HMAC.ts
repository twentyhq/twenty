import { Field, ObjectType } from '@nestjs/graphql';

import { User } from 'src/core/@generated/user/user.model';

@ObjectType()
export class UserWithHMACKey extends User {
  @Field(() => String, { nullable: true })
  supportHMACKey: string | null;
}
