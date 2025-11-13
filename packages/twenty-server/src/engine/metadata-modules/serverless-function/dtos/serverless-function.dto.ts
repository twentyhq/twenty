import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  Authorize,
  IDField,
  QueryOptions,
} from '@ptc-org/nestjs-query-graphql';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CronTriggerDTO } from 'src/engine/metadata-modules/cron-trigger/dtos/cron-trigger.dto';
import { DatabaseEventTriggerDTO } from 'src/engine/metadata-modules/database-event-trigger/dtos/database-event-trigger.dto';
import { RouteTriggerDTO } from 'src/engine/metadata-modules/route-trigger/dtos/route-trigger.dto';

@ObjectType('ServerlessFunction')
@Authorize({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.workspace?.id },
  }),
})
@QueryOptions({
  defaultResultSize: 10,
  maxResultsSize: 1000,
})
export class ServerlessFunctionDTO {
  @IsUUID()
  @IsNotEmpty()
  @IDField(() => UUIDScalarType)
  id: string;

  @IsString()
  @Field()
  name: string;

  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  runtime: string;

  @IsNumber()
  @Field()
  timeoutSeconds: number;

  @IsString()
  @Field({ nullable: true })
  latestVersion?: string;

  @IsString()
  @Field()
  handlerPath: string;

  @IsString()
  @Field()
  handlerName: string;

  @IsArray()
  @Field(() => [String], { nullable: false })
  publishedVersions: string[];

  @Field(() => [CronTriggerDTO], { nullable: true })
  cronTriggers?: CronTriggerDTO[];

  @Field(() => [DatabaseEventTriggerDTO], { nullable: true })
  databaseEventTriggers?: DatabaseEventTriggerDTO[];

  @Field(() => [RouteTriggerDTO], { nullable: true })
  routeTriggers?: RouteTriggerDTO[];

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
