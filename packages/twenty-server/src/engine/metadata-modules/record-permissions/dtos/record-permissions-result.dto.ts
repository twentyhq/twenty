import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RecordPermissionsDTO } from 'src/engine/core-modules/record-share/dtos/record-permissions.dto';

@InputType()
export class RecordPermissionsTargetInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsUUID()
  @Field(() => UUIDScalarType)
  recordId: string;
}

@ObjectType()
export class RecordPermissionsResult {
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @Field(() => UUIDScalarType)
  recordId: string;

  @Field(() => RecordPermissionsDTO)
  permissions: RecordPermissionsDTO;
}
