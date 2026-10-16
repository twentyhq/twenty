import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';
import { createStandardFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

type StandardObjectNameWithTargetMorphField =
  | 'agentChatThreadTarget'
  | 'attachment'
  | 'calendarEventTarget'
  | 'messageThreadTarget'
  | 'noteTarget'
  | 'taskTarget'
  | 'timelineActivity';

export const createStandardMorphRelationHeadFlatMetadata = ({
  objectName,
  ...args
}: StandardBuilderArgs<'fieldMetadata'> & {
  objectName: StandardObjectNameWithTargetMorphField;
}): FlatFieldMetadata => ({
  ...createStandardFieldFlatMetadata({
    ...args,
    objectName,
    context: {
      fieldName: 'target',
      type: FieldMetadataType.MORPH_RELATION,
      label: i18nLabel(
        msg({ message: 'Related to', context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: 'Related record',
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconRelationManyToOne',
      isUIEditable: false,
      settings: { relationType: RelationType.MANY_TO_ONE },
    },
  }),
  morphId: STANDARD_OBJECTS[objectName].morphIds.targetMorphId.morphId,
  isSystemSideEffect: true,
});
