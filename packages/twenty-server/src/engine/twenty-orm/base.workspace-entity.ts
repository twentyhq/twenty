import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { DateDisplayFormat } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
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
  deletedAt: string | null;
}
