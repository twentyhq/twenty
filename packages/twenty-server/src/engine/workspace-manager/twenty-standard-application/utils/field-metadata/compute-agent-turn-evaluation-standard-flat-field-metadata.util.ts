import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  MetadataWritability,
  RelationType,
  RelationOnDeleteAction,
} from 'twenty-shared/types';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const buildAgentTurnEvaluationStandardFlatFieldMetadatas = (
  args: Omit<
    CreateStandardFieldArgs<'agentTurnEvaluation', FieldMetadataType>,
    'context'
  >,
): Record<
  AllStandardObjectFieldName<'agentTurnEvaluation'>,
  FlatFieldMetadata
> => ({
  id: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'id',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({ message: 'ID', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'ID', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconId',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: 'uuid',
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  score: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'score',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(
          msg({ message: 'Score', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Score', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconNumber',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  comment: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'comment',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: 'Comment', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Comment', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconText',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  createdAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Created At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Created At', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconCalendar',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: 'now',
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  updatedAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'updatedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Updated At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Updated At', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconCalendar',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: 'now',
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  deletedAt: {
    ...createStandardFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'deletedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: 'Deleted At', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Deleted At', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconCalendar',
        isSystem: true,
        isUIEditable: false,
        isNullable: true,
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  turn: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'turn',
        type: FieldMetadataType.RELATION,
        label: i18nLabel(
          msg({ message: 'Turn', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Turn', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconRelationOneToMany',
        isUIEditable: false,
        isNullable: false,
        targetObjectName: 'agentTurn',
        targetFieldName: 'evaluations',
        morphId: null,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'turnId',
        },
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
});
