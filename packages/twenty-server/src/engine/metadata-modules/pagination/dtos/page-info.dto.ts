import { Field, ObjectType } from '@nestjs/graphql';

import { ConnectionCursorScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('PageInfo')
export class PageInfoDTO {
  @Field(() => Boolean, {
    nullable: true,
    description: 'true if paging forward and there are more records.',
  })
  hasNextPage?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'true if paging backwards and there are more records.',
  })
  hasPreviousPage?: boolean;

  @Field(() => ConnectionCursorScalarType, {
    nullable: true,
    description: 'The cursor of the first returned record.',
  })
  startCursor?: string | null;

  @Field(() => ConnectionCursorScalarType, {
    nullable: true,
    description: 'The cursor of the last returned record.',
  })
  endCursor?: string | null;
}
