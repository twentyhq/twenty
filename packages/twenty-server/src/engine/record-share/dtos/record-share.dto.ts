import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

registerEnumType(RecordShareAccessLevel, { name: 'RecordShareAccessLevel' });
registerEnumType(RecordSharePrincipalType, {
  name: 'RecordSharePrincipalType',
});
registerEnumType(RecordShareRowCause, { name: 'RecordShareRowCause' });

@ObjectType('RecordShare')
export class RecordShareDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  principalId: string;

  @Field(() => RecordSharePrincipalType)
  principalType: RecordSharePrincipalType;

  @Field(() => RecordShareAccessLevel)
  accessLevel: RecordShareAccessLevel;

  @Field(() => RecordShareRowCause)
  rowCause: RecordShareRowCause;

  @Field(() => String)
  sourceId: string;
}

@ObjectType('RecordShares')
export class RecordSharesDTO {
  @Field(() => [RecordShareDTO])
  shares: RecordShareDTO[];

  @Field(() => RecordShareAccessLevel, { nullable: true })
  viewerAccessLevel: RecordShareAccessLevel | null;
}
