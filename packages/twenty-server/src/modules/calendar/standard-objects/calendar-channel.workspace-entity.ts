import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { CALENDAR_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';

export enum CalendarChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.calendarChannel,
  namePlural: 'calendarChannels',
  labelSingular: 'Calendar Channel',
  labelPlural: 'Calendar Channels',
  description: 'Calendar Channels',
  icon: 'IconCalendar',
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class CalendarChannelWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconAt',
  })
  handle: string;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.visibility,
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
    defaultValue: `'${CalendarChannelVisibility.SHARE_EVERYTHING}'`,
  })
  visibility: string;

  @WorkspaceField({
    standardId:
      CALENDAR_CHANNEL_STANDARD_FIELD_IDS.isContactAutoCreationEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Contact Auto Creation Enabled',
    description: 'Is Contact Auto Creation Enabled',
    icon: 'IconUserCircle',
    defaultValue: true,
  })
  isContactAutoCreationEnabled: boolean;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.isSyncEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Sync Enabled',
    description: 'Is Sync Enabled',
    icon: 'IconRefresh',
    defaultValue: true,
  })
  isSyncEnabled: boolean;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncCursor,
    type: FieldMetadataType.TEXT,
    label: 'Sync Cursor',
    description:
      'Sync Cursor. Used for syncing events from the calendar provider',
    icon: 'IconReload',
  })
  syncCursor: string;

  @WorkspaceField({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.throttleFailureCount,
    type: FieldMetadataType.NUMBER,
    label: 'Throttle Failure Count',
    description: 'Throttle Failure Count',
    icon: 'IconX',
    defaultValue: 0,
  })
  throttleFailureCount: number;

  @WorkspaceRelation({
    standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Connected Account',
    description: 'Connected Account',
    icon: 'IconUserCircle',
    joinColumn: 'connectedAccountId',
    inverseSideTarget: () => ConnectedAccountWorkspaceEntity,
    inverseSideFieldKey: 'calendarChannels',
  })
  connectedAccount: Relation<ConnectedAccountWorkspaceEntity>;

  @WorkspaceRelation({
    standardId:
      CALENDAR_CHANNEL_STANDARD_FIELD_IDS.calendarChannelEventAssociations,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Calendar Channel Event Associations',
    description: 'Calendar Channel Event Associations',
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarChannelEventAssociationWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  calendarChannelEventAssociations: Relation<
    CalendarChannelEventAssociationWorkspaceEntity[]
  >;
}
