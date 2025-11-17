import { msg } from '@lingui/core/macro';
import { DateDisplayFormat, FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsPrimaryField } from 'src/engine/twenty-orm/decorators/workspace-is-primary-field.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';

export type BaseWorkspaceEntityFieldIds = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};

export function createBaseWorkspaceEntity(
  fieldIds: BaseWorkspaceEntityFieldIds,
) {
  abstract class BaseWorkspaceEntity {
    @WorkspaceField({
      universalIdentifier: fieldIds.id,
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
      universalIdentifier: fieldIds.createdAt,
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
      universalIdentifier: fieldIds.updatedAt,
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
      universalIdentifier: fieldIds.deletedAt,
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

  return BaseWorkspaceEntity;
}
