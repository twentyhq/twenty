import { Field, ObjectType } from '@nestjs/graphql';

import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';

@ObjectType('SharingRule')
export class SharingRuleDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  universalIdentifier: string;

  @Field(() => UUIDScalarType)
  applicationId: string;

  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => RecordSharePrincipalType)
  granteePrincipalType: RecordSharePrincipalType;

  @Field(() => UUIDScalarType, { nullable: true })
  granteePrincipalId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  granteeRoleId: string | null;

  @Field(() => RecordShareAccessLevel)
  accessLevel: RecordShareAccessLevel;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [RowLevelPermissionPredicateDTO], { nullable: true })
  rowLevelPermissionPredicates?: RowLevelPermissionPredicateDTO[];

  @Field(() => [RowLevelPermissionPredicateGroupDTO], { nullable: true })
  rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupDTO[];
}
