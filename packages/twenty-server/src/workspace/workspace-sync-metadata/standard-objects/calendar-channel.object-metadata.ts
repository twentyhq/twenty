import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/metadata/relation-metadata/relation-metadata.entity';
import { FeatureFlagKeys } from 'src/core/feature-flag/feature-flag.entity';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/connected-account.object-metadata';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-channel-event-association.object-metadata';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';

export enum CalendarChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
}

@ObjectMetadata({
  namePlural: 'calendarChannels',
  labelSingular: 'Calendar Channel',
  labelPlural: 'Calendar Channels',
  description: 'Calendar Channels',
  icon: 'IconCalendar',
})
@IsSystem()
@Gate({
  featureFlag: FeatureFlagKeys.IsCalendarEnabled,
})
export class CalendarChannelObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Connected Account',
    description: 'Connected Account',
    icon: 'IconUserCircle',
    joinColumn: 'connectedAccountId',
  })
  connectedAccount: ConnectedAccountObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconAt',
  })
  handle: string;

  @FieldMetadata({
    type: FieldMetadataType.SELECT,
    label: 'Visibility',
    description: 'Visibility',
    icon: 'IconEyeglass',
    options: [
      {
        value: CalendarChannelVisibility.METADATA,
        label: 'Metadata',
        position: 0,
        color: 'green',
      },
      {
        value: CalendarChannelVisibility.SHARE_EVERYTHING,
        label: 'Share Everything',
        position: 1,
        color: 'orange',
      },
    ],
    defaultValue: { value: CalendarChannelVisibility.SHARE_EVERYTHING },
  })
  visibility: string;

  @FieldMetadata({
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Contact Auto Creation Enabled',
    description: 'Is Contact Auto Creation Enabled',
    icon: 'IconUserCircle',
    defaultValue: { value: true },
  })
  isContactAutoCreationEnabled: boolean;

  @FieldMetadata({
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Sync Enabled',
    description: 'Is Sync Enabled',
    icon: 'IconRefresh',
    defaultValue: { value: true },
  })
  isSyncEnabled: boolean;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Sync Cursor',
    description:
      'Sync Cursor. Used for syncing events from the calendar provider',
    icon: 'IconReload',
  })
  syncCursor: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Calendar Channel Event Associations',
    description: 'Calendar Channel Event Associations',
    icon: 'IconCalendar',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => CalendarChannelEventAssociationObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  calendarChannelEventAssociations: CalendarChannelEventAssociationObjectMetadata[];
}
