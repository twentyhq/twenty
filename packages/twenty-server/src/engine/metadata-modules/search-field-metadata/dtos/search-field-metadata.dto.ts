import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  Authorize,
  IDField,
  QueryOptions,
} from '@ptc-org/nestjs-query-graphql';
import { IsDateString, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('SearchField')
@Authorize({
  // oxlint-disable-next-line typescript/no-explicit-any
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.workspace?.id },
  }),
})
@QueryOptions({
  defaultResultSize: 10,
  disableSort: true,
  maxResultsSize: 1000,
})
export class SearchFieldMetadataDTO {
  @IsUUID()
  @IsNotEmpty()
  @IDField(() => UUIDScalarType)
  id: string;

  objectMetadataId: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  fieldMetadataId: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  tsVectorFieldMetadataId: string;

  @IsNumber()
  @IsNotEmpty()
  @Field()
  position: number;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;

  @HideField()
  workspaceId: string;
}
