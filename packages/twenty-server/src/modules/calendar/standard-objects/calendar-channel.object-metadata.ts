import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { FeatureFlagKeys } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { calendarChannelStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/gate.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.object-metadata';
import { RelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/relation-metadata.decorator';

export enum CalendarChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
}

@ObjectMetadata({
  standardId: standardObjectIds.calendarChannel,
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
    standardId: calendarChannelStandardFieldIds.connectedAccount,
    type: FieldMetadataType.RELATION,
    label: 'Connected Account',
    description: 'Connected Account',
    icon: 'IconUserCircle',
    joinColumn: 'connectedAccountId',
  })
  connectedAccount: ConnectedAccountObjectMetadata;

  @FieldMetadata({
    standardId: calendarChannelStandardFieldIds.handle,
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconAt',
  })
  handle: string;

  @FieldMetadata({
    standardId: calendarChannelStandardFieldIds.visibility,
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
    defaultValue: { value: `'${CalendarChannelVisibility.SHARE_EVERYTHING}'` },
  })
  visibility: string;

  @FieldMetadata({
    standardId: calendarChannelStandardFieldIds.isContactAutoCreationEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Contact Auto Creation Enabled',
    description: 'Is Contact Auto Creation Enabled',
    icon: 'IconUserCircle',
    defaultValue: { value: true },
  })
  isContactAutoCreationEnabled: boolean;

  @FieldMetadata({
    standardId: calendarChannelStandardFieldIds.isSyncEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Sync Enabled',
    description: 'Is Sync Enabled',
    icon: 'IconRefresh',
    defaultValue: { value: true },
  })
  isSyncEnabled: boolean;

  @FieldMetadata({
    standardId: calendarChannelStandardFieldIds.syncCursor,
    type: FieldMetadataType.TEXT,
    label: 'Sync Cursor',
    description:
      'Sync Cursor. Used for syncing events from the calendar provider',
    icon: 'IconReload',
  })
  syncCursor: string;

  @FieldMetadata({
    standardId:
      calendarChannelStandardFieldIds.calendarChannelEventAssociations,
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
