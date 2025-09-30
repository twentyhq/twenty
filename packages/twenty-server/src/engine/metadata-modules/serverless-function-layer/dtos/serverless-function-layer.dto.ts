import { Field, ObjectType } from '@nestjs/graphql';

import { IsDateString } from 'class-validator';
import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ServerlessFunctionLayer')
export class ServerlessFunctionLayerDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @IDField(() => UUIDScalarType, { nullable: true })
  applicationId?: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
