import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  WORKSPACE_MEMBER_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const workspaceMembersAllView = ({
  objectMetadataItems,
  twentyStandardFlatApplication,
  useCoreNaming,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  twentyStandardFlatApplication: FlatApplication;
}): ViewDefinition => {
  const workspaceMemberObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.workspaceMember,
  );

  if (!workspaceMemberObjectMetadata) {
    throw new Error('WorkspaceMember object metadata not found');
  }

  const viewUniversalIdentifier =
    STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers
      .universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming
      ? msg`All {objectLabelPlural}`
      : 'All Workspace Members',
    objectMetadataId: workspaceMemberObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          workspaceMemberObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKSPACE_MEMBER_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
        universalIdentifier:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .name.universalIdentifier,
      },
      {
        fieldMetadataId:
          workspaceMemberObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              WORKSPACE_MEMBER_STANDARD_FIELD_IDS.userEmail,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 180,
        universalIdentifier:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .userEmail.universalIdentifier,
      },
      {
        fieldMetadataId:
          workspaceMemberObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              WORKSPACE_MEMBER_STANDARD_FIELD_IDS.avatarUrl,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .avatarUrl.universalIdentifier,
      },
      {
        fieldMetadataId:
          workspaceMemberObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              WORKSPACE_MEMBER_STANDARD_FIELD_IDS.colorScheme,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .colorScheme.universalIdentifier,
      },
      {
        fieldMetadataId:
          workspaceMemberObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKSPACE_MEMBER_STANDARD_FIELD_IDS.locale,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 120,
        universalIdentifier:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .locale.universalIdentifier,
      },
      {
        fieldMetadataId:
          workspaceMemberObjectMetadata.fields.find(
            (field) =>
              field.standardId === WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timeZone,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .timeZone.universalIdentifier,
      },
      {
        fieldMetadataId:
          workspaceMemberObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              WORKSPACE_MEMBER_STANDARD_FIELD_IDS.dateFormat,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 120,
        universalIdentifier:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .dateFormat.universalIdentifier,
      },
      {
        fieldMetadataId:
          workspaceMemberObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timeFormat,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 120,
        universalIdentifier:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .timeFormat.universalIdentifier,
      },
      {
        fieldMetadataId:
          workspaceMemberObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 8,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .createdAt.universalIdentifier,
      },
    ],
  };
};
