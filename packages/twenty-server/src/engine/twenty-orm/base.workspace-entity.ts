import { msg } from '@lingui/core/macro';
import { FieldMetadataType, DateDisplayFormat } from 'twenty-shared/types';

import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsPrimaryField } from 'src/engine/twenty-orm/decorators/workspace-is-primary-field.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export abstract class BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
    type: FieldMetadataType.UUID,
    label: msg`Id`,
    description: msg`Id`,
    defaultValue: 'uuid',
    icon: 'Icon123',
  })
  @WorkspaceIsPrimaryField()
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  id: string;

  @WorkspaceField({
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Creation date`,
    description: msg`Creation date`,
    icon: 'IconCalendar',
    defaultValue: 'now',
    settings: {
      displayFormat: DateDisplayFormat.RELATIVE,
    },
  })
  @WorkspaceIsFieldUIReadOnly()
  createdAt: string;

  @WorkspaceField({
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Last update`,
    description: msg`Last time the record was changed`,
    icon: 'IconCalendarClock',
    defaultValue: 'now',
    settings: {
      displayFormat: DateDisplayFormat.RELATIVE,
    },
  })
  @WorkspaceIsFieldUIReadOnly()
  updatedAt: string;

  @WorkspaceField({
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.deletedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Deleted at`,
    description: msg`Date when the record was deleted`,
    icon: 'IconCalendarMinus',
    settings: {
      displayFormat: DateDisplayFormat.RELATIVE,
    },
  })
  @WorkspaceIsNullable()
  @WorkspaceIsFieldUIReadOnly()
  deletedAt: string | null;
}
