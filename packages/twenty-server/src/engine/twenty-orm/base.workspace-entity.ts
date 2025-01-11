import { FieldMetadataType } from 'twenty-shared';

import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsPrimaryField } from 'src/engine/twenty-orm/decorators/workspace-is-primary-field.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export abstract class BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
    type: FieldMetadataType.UUID,
    label: 'Id',
    description: 'Id',
    defaultValue: 'uuid',
    icon: 'Icon123',
  })
  @WorkspaceIsPrimaryField()
  @WorkspaceIsSystem()
  id: string;

  @WorkspaceField({
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Creation date',
    description: 'Creation date',
    icon: 'IconCalendar',
    defaultValue: 'now',
    settings: {
      displayAsRelativeDate: true,
    },
  })
  createdAt: string;

  @WorkspaceField({
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Last update',
    description: 'Last time the record was changed',
    icon: 'IconCalendarClock',
    defaultValue: 'now',
    settings: {
      displayAsRelativeDate: true,
    },
  })
  updatedAt: string;

  @WorkspaceField({
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.deletedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Deleted at',
    description: 'Date when the record was deleted',
    icon: 'IconCalendarMinus',
    settings: {
      displayAsRelativeDate: true,
    },
  })
  @WorkspaceIsNullable()
  deletedAt: string | null;
}
