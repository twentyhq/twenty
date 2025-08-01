import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class RemoteTableInput {
  @Field(() => UUIDScalarType)
  remoteServerId: string;

  @Field(() => String)
  name: string;
}
