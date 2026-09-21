import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { buildStandardTargetFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/build-standard-target-flat-field-metadatas.util';
import { type CreateStandardFieldArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const buildCalendarEventTargetStandardFlatFieldMetadatas = ({
  ...args
}: Omit<
  CreateStandardFieldArgs<'calendarEventTarget', FieldMetadataType>,
  'context'
>): Record<
  AllStandardObjectFieldName<'calendarEventTarget'>,
  FlatFieldMetadata
> => ({
  ...buildStandardTargetFlatFieldMetadatas({
    ...args,
    inverseTargetFieldName: 'calendarEventTargets',
    morphId:
      STANDARD_OBJECTS.calendarEventTarget.morphIds.targetMorphId.morphId,
  }),
  calendarEvent: createStandardRelationFieldFlatMetadata({
    ...args,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'calendarEvent',
      label: i18nLabel(
        msg({ message: `Calendar event`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Calendar event target event`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendar',
      isNullable: false,
      isUIEditable: false,
      targetObjectName: 'calendarEvent',
      targetFieldName: 'calendarEventTargets',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'calendarEventId',
      },
    },
  }),
});
