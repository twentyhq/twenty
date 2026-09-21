import { msg } from '@lingui/core/macro';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  DateDisplayFormat,
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
export const buildAgentChatThreadTargetStandardFlatFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardFieldArgs<'agentChatThreadTarget', FieldMetadataType>,
  'context'
>): Record<
  AllStandardObjectFieldName<'agentChatThreadTarget'>,
  FlatFieldMetadata
> => ({
  id: {
    ...createStandardFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        fieldName: 'id',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({ message: `ID`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: `ID`, context: 'fieldMetadata.description' }),
        ),
        icon: 'Icon123',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
        defaultValue: 'uuid',
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  createdAt: {
    ...createStandardFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        fieldName: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: `Creation date`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Creation date`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconCalendar',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
        defaultValue: 'now',
        settings: {
          displayFormat: DateDisplayFormat.RELATIVE,
        },
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  updatedAt: {
    ...createStandardFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        fieldName: 'updatedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: `Last update`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Last time the record was changed`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconCalendarClock',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
        defaultValue: 'now',
        settings: {
          displayFormat: DateDisplayFormat.RELATIVE,
        },
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  deletedAt: {
    ...createStandardFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        fieldName: 'deletedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: `Deleted at`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Date when the record was deleted`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconCalendarMinus',
        isSystem: true,
        isNullable: true,
        isUIEditable: false,
        settings: {
          displayFormat: DateDisplayFormat.RELATIVE,
        },
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  thread: {
    ...createStandardRelationFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        type: FieldMetadataType.RELATION,
        morphId: null,
        fieldName: 'thread',
        label: i18nLabel(
          msg({ message: `Thread`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Agent chat thread`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMessage',
        isNullable: false,
        isUIEditable: false,
        targetObjectName: 'agentChatThread',
        targetFieldName: 'targets',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'threadId',
        },
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  targetPerson: {
    ...createStandardRelationFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        type: FieldMetadataType.MORPH_RELATION,
        morphId:
          STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId.morphId,
        fieldName: 'targetPerson',
        label: i18nLabel(
          msg({ message: `Person`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Record linked to the agent chat thread`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMessage',
        isNullable: true,
        isUIEditable: false,
        isSystemSideEffect: true,
        targetObjectName: 'person',
        targetFieldName: 'agentChatThreadTargets',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'targetPersonId',
        },
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  targetCompany: {
    ...createStandardRelationFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        type: FieldMetadataType.MORPH_RELATION,
        morphId:
          STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId.morphId,
        fieldName: 'targetCompany',
        label: i18nLabel(
          msg({ message: `Company`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Record linked to the agent chat thread`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMessage',
        isNullable: true,
        isUIEditable: false,
        isSystemSideEffect: true,
        targetObjectName: 'company',
        targetFieldName: 'agentChatThreadTargets',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'targetCompanyId',
        },
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
  targetOpportunity: {
    ...createStandardRelationFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        type: FieldMetadataType.MORPH_RELATION,
        morphId:
          STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId.morphId,
        fieldName: 'targetOpportunity',
        label: i18nLabel(
          msg({ message: `Opportunity`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Record linked to the agent chat thread`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMessage',
        isNullable: true,
        isUIEditable: false,
        isSystemSideEffect: true,
        targetObjectName: 'opportunity',
        targetFieldName: 'agentChatThreadTargets',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'targetOpportunityId',
        },
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    writability: MetadataWritability.SYSTEM,
    isAuditLogged: false,
  },
});
