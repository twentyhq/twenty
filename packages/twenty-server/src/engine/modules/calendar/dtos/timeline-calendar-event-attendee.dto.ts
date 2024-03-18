import { ObjectType, Field, ID } from '@nestjs/graphql';

import { FieldMetadataType } from 'src/engine-metadata/field-metadata/field-metadata.entity';
import {
  calendarEventAttendeeStandardFieldIds,
  personStandardFieldIds,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';

@ObjectType('TimelineCalendarEventAttendee')
export class TimelineCalendarEventAttendee {
  @Field(() => ID, { nullable: true })
  personId: string;

  @Field(() => ID, { nullable: true })
  workspaceMemberId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @FieldMetadata({
    standardId: calendarEventAttendeeStandardFieldIds.displayName,
    type: FieldMetadataType.TEXT,
    label: 'Display Name',
    description: 'Display Name',
    icon: 'IconUser',
  })
  displayName: string;

  @FieldMetadata({
    standardId: personStandardFieldIds.avatarUrl,
    type: FieldMetadataType.TEXT,
    label: 'Avatar',
    description: 'Contact’s avatar',
    icon: 'IconFileUpload',
  })
  @IsSystem()
  avatarUrl: string;

  @FieldMetadata({
    standardId: calendarEventAttendeeStandardFieldIds.handle,
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconMail',
  })
  handle: string;
}
