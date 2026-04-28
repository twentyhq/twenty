import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { ViewKey, ViewRoadmapZoom, ViewType } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('MinimalView')
export class MinimalViewDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => ViewType)
  type: ViewType;

  @Field(() => ViewKey, { nullable: true })
  key: ViewKey | null;

  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  // Roadmap configuration is exposed in the minimal DTO because the
  // RoadmapContainer guards on these fields — without them the first paint
  // after a reload renders null and, since the views atom is cached with
  // `status: 'up-to-date'`, no subsequent fetch upgrades the data.
  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldStartId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldEndId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldGroupId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldColorId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldLabelId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldPlannedStartId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldPlannedEndId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldStatusId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldBlockedById: string | null;

  @Field(() => ViewRoadmapZoom, { nullable: true })
  roadmapDefaultZoom: ViewRoadmapZoom | null;

  @Field(() => Boolean, { nullable: true })
  roadmapShowToday: boolean | null;

  @Field(() => Boolean, { nullable: true })
  roadmapShowWeekends: boolean | null;

  @Field(() => Boolean, { nullable: true })
  roadmapShowDeviation: boolean | null;
}
