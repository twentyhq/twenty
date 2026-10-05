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

export const buildMessageThreadTargetStandardFlatFieldMetadatas = ({
  ...args
}: Omit<
  CreateStandardFieldArgs<'messageThreadTarget', FieldMetadataType>,
  'context'
>): Record<
  AllStandardObjectFieldName<'messageThreadTarget'>,
  FlatFieldMetadata
> => ({
  ...buildStandardTargetFlatFieldMetadatas({
    ...args,
    inverseTargetFieldName: 'messageThreadTargets',
    morphId:
      STANDARD_OBJECTS.messageThreadTarget.morphIds.targetMorphId.morphId,
  }),
  messageThread: createStandardRelationFieldFlatMetadata({
    ...args,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'messageThread',
      label: i18nLabel(
        msg({ message: `Message thread`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Message thread target thread`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconMessage',
      isNullable: false,
      isUIEditable: false,
      targetObjectName: 'messageThread',
      targetFieldName: 'messageThreadTargets',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'messageThreadId',
      },
    },
  }),
});
