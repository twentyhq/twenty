import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  MetadataWritability,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const buildAgentChatThreadTargetStandardFlatFieldMetadatas = (
  args: Omit<
    CreateStandardFieldArgs<'agentChatThreadTarget', FieldMetadataType>,
    'context'
  >,
): Record<
  AllStandardObjectFieldName<'agentChatThreadTarget'>,
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
  thread: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'thread',
        type: FieldMetadataType.RELATION,
        label: i18nLabel(
          msg({ message: 'Thread', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: 'Thread', context: 'fieldMetadata.description' }),
        ),
        icon: 'IconRelationOneToMany',
        isUIEditable: false,
        isNullable: false,
        targetObjectName: 'agentChatThread',
        targetFieldName: 'recordTargets',
        morphId: null,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'threadId',
        },
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  targetPerson: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'targetPerson',
        type: FieldMetadataType.MORPH_RELATION,
        label: i18nLabel(
          msg({ message: 'Person', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Record the chat is attached to',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconUser',
        isNullable: true,
        isUIEditable: false,
        isSystemSideEffect: true,
        targetObjectName: 'person',
        targetFieldName: 'agentChatThreadTargets',
        morphId:
          STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId.morphId,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'targetPersonId',
        },
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  targetCompany: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'targetCompany',
        type: FieldMetadataType.MORPH_RELATION,
        label: i18nLabel(
          msg({ message: 'Company', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Record the chat is attached to',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconBuildingSkyscraper',
        isNullable: true,
        isUIEditable: false,
        isSystemSideEffect: true,
        targetObjectName: 'company',
        targetFieldName: 'agentChatThreadTargets',
        morphId:
          STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId.morphId,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'targetCompanyId',
        },
      },
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  targetOpportunity: {
    ...createStandardRelationFieldFlatMetadata({
      ...args,
      context: {
        fieldName: 'targetOpportunity',
        type: FieldMetadataType.MORPH_RELATION,
        label: i18nLabel(
          msg({ message: 'Opportunity', context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: 'Record the chat is attached to',
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconTargetArrow',
        isNullable: true,
        isUIEditable: false,
        isSystemSideEffect: true,
        targetObjectName: 'opportunity',
        targetFieldName: 'agentChatThreadTargets',
        morphId:
          STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId.morphId,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'targetOpportunityId',
        },
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
});
