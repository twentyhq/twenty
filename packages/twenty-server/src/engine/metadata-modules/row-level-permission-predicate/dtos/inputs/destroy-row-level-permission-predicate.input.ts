/* @license Enterprise */

import { InputType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DestroyRowLevelPermissionPredicateInput {
  @IDField(() => UUIDScalarType, {
    description: 'The id of the row level permission predicate to destroy.',
  })
  @IsUUID()
  id: string;
}
