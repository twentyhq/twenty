import { Field, InputType, Int } from '@nestjs/graphql';

import { ConnectionCursorScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('CursorPaging')
export class CursorPagingInput {
  @Field(() => ConnectionCursorScalarType, {
    nullable: true,
    description: 'Paginate before opaque cursor',
  })
  before?: string;

  @Field(() => ConnectionCursorScalarType, {
    nullable: true,
    description: 'Paginate after opaque cursor',
  })
  after?: string;

  @Field(() => Int, { nullable: true, description: 'Paginate first' })
  first?: number;

  @Field(() => Int, { nullable: true, description: 'Paginate last' })
  last?: number;
}
