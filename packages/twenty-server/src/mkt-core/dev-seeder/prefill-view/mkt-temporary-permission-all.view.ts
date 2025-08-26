import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { MKT_TEMPORARY_PERMISSION_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktTemporaryPermissionsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktTemporaryPermission,
  );

  if (!itemObjectMetadata) {
    throw new Error('Temporary Permission object metadata not found');
  }

  return {
    name: 'All Temporary Permissions',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 18,
    icon: 'IconClock',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      // Grantee (Person who receives permission)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_TEMPORARY_PERMISSION_FIELD_IDS.granteeWorkspaceMember,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      // Object Name
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_TEMPORARY_PERMISSION_FIELD_IDS.objectName,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      // Permissions granted
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_TEMPORARY_PERMISSION_FIELD_IDS.canRead,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 80,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_TEMPORARY_PERMISSION_FIELD_IDS.canUpdate,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 80,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_TEMPORARY_PERMISSION_FIELD_IDS.canDelete,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 80,
      },
      // Expires At
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_TEMPORARY_PERMISSION_FIELD_IDS.expiresAt,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
      // Status
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_TEMPORARY_PERMISSION_FIELD_IDS.isActive,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 80,
      },
      // Reason
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_TEMPORARY_PERMISSION_FIELD_IDS.reason,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 200,
      },
      // Granter (Person who granted permission)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_TEMPORARY_PERMISSION_FIELD_IDS.granterWorkspaceMember,
          )?.id ?? '',
        position: 8,
        isVisible: true,
        size: 180,
      },
      // Record ID (specific record if applicable)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_TEMPORARY_PERMISSION_FIELD_IDS.recordId,
          )?.id ?? '',
        position: 9,
        isVisible: false,
        size: 200,
      },
      // Purpose (detailed explanation)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_TEMPORARY_PERMISSION_FIELD_IDS.purpose,
          )?.id ?? '',
        position: 10,
        isVisible: false,
        size: 250,
      },
      // Revocation details
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_TEMPORARY_PERMISSION_FIELD_IDS.revokedAt,
          )?.id ?? '',
        position: 11,
        isVisible: false,
        size: 150,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_TEMPORARY_PERMISSION_FIELD_IDS.revokedBy,
          )?.id ?? '',
        position: 12,
        isVisible: false,
        size: 180,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_TEMPORARY_PERMISSION_FIELD_IDS.revokeReason,
          )?.id ?? '',
        position: 13,
        isVisible: false,
        size: 200,
      },
      // Standard fields
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 14,
        isVisible: false,
        size: 150,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
          )?.id ?? '',
        position: 15,
        isVisible: false,
        size: 150,
      },
    ],
  };
};

// Export view for active permissions only
export const mktActiveTemporaryPermissionsView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const baseView = mktTemporaryPermissionsAllView(objectMetadataItems);

  return {
    ...baseView,
    name: 'Active Temporary Permissions',
    position: 19,
    filters: [
      {
        fieldMetadataId:
          objectMetadataItems
            .find(
              (object) =>
                object.standardId === MKT_OBJECT_IDS.mktTemporaryPermission,
            )
            ?.fields.find(
              (field) =>
                field.standardId ===
                MKT_TEMPORARY_PERMISSION_FIELD_IDS.isActive,
            )?.id ?? '',
        operand: 'IS',
        value: true,
        displayValue: 'Active',
      },
    ],
  };
};

// Export view for expired permissions
export const mktExpiredTemporaryPermissionsView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const baseView = mktTemporaryPermissionsAllView(objectMetadataItems);

  return {
    ...baseView,
    name: 'Expired Temporary Permissions',
    position: 20,
    icon: 'IconClockX',
    filters: [
      {
        fieldMetadataId:
          objectMetadataItems
            .find(
              (object) =>
                object.standardId === MKT_OBJECT_IDS.mktTemporaryPermission,
            )
            ?.fields.find(
              (field) =>
                field.standardId ===
                MKT_TEMPORARY_PERMISSION_FIELD_IDS.expiresAt,
            )?.id ?? '',
        operand: 'IS_BEFORE',
        value: 'NOW',
        displayValue: 'Expired',
      },
    ],
  };
};

// Export view for revoked permissions
export const mktRevokedTemporaryPermissionsView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const baseView = mktTemporaryPermissionsAllView(objectMetadataItems);

  return {
    ...baseView,
    name: 'Revoked Temporary Permissions',
    position: 21,
    icon: 'IconUserX',
    filters: [
      {
        fieldMetadataId:
          objectMetadataItems
            .find(
              (object) =>
                object.standardId === MKT_OBJECT_IDS.mktTemporaryPermission,
            )
            ?.fields.find(
              (field) =>
                field.standardId ===
                MKT_TEMPORARY_PERMISSION_FIELD_IDS.revokedAt,
            )?.id ?? '',
        operand: 'IS_NOT_EMPTY',
        value: '',
        displayValue: 'Has been revoked',
      },
    ],
  };
};
