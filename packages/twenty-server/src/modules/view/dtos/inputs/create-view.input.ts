import { InputType, Field } from '@nestjs/graphql';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';

@InputType()
export class CreateViewInput {
  @Field({ nullable: false })
  name: string;

  @Field(() => UUIDScalarType, { nullable: false })
  objectMetadataId: string;

  @Field({ nullable: true, defaultValue: 'table' })
  type?: string;

  @Field({ nullable: true, defaultValue: 'INDEX' })
  key?: string;

  @Field({ nullable: false })
  icon: string;

  @Field({ nullable: true, defaultValue: 0 })
  position?: number;

  @Field({ nullable: true, defaultValue: false })
  isCompact?: boolean;

  @Field(() => ViewOpenRecordIn, {
    nullable: true,
    defaultValue: ViewOpenRecordIn.SIDE_PANEL,
  })
  openRecordIn?: ViewOpenRecordIn;

  @Field(() => AggregateOperations, { nullable: true })
  kanbanAggregateOperation?: AggregateOperations;

  @Field(() => UUIDScalarType, { nullable: true })
  kanbanAggregateOperationFieldMetadataId?: string;

  @Field({ nullable: true })
  anyFieldFilterValue?: string;
}
