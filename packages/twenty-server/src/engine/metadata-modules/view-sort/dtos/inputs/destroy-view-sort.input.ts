import { InputType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DestroyViewSortInput {
  @IDField(() => UUIDScalarType, {
    description: 'The id of the view sort to destroy.',
  })
  @IsUUID()
  id: string;
}
