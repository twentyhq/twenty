import { Field, InputType } from '@nestjs/graphql';

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('ShareWithInput', {
  description:
    'Grants access on the record to exactly one of a workspace member, a role or everyone',
})
export class ShareWithInput {
  @Field(() => UUIDScalarType, { nullable: true })
  workspaceMemberId?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  roleId?: string;

  @Field(() => Boolean, { nullable: true })
  everyone?: boolean;

  @Field(() => RecordShareAccessLevel)
  accessLevel: RecordShareAccessLevel;
}
