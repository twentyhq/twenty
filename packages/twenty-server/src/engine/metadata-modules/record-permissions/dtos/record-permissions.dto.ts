import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RecordPermissionsDTO {
  @Field(() => Boolean)
  canRead: boolean;

  @Field(() => Boolean)
  canUpdate: boolean;

  @Field(() => Boolean)
  canDelete: boolean;

  @Field(() => Boolean)
  canSoftDelete: boolean;
}
