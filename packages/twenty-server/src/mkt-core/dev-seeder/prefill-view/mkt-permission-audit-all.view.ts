import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { MKT_PERMISSION_AUDIT_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktPermissionAuditsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktPermissionAudit,
  );

  if (!itemObjectMetadata) {
    throw new Error('Permission Audit object metadata not found');
  }

  return {
    name: 'All Permission Audits',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 23,
    icon: 'IconShieldSearch',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      // Created At (most recent first for audit logs)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      // Workspace Member (who performed action)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.workspaceMember,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      // Action (what was attempted)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.action,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 100,
      },
      // Object Name (what object was accessed)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.objectName,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 140,
      },
      // Check Result (granted/denied)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.checkResult,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 100,
      },
      // Permission Source (how was it authorized)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.permissionSource,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 130,
      },
      // Check Duration (performance metric)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.checkDurationMs,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 120,
      },
      // IP Address (security context)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.ipAddress,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 140,
      },
      // Record ID (specific record accessed)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.recordId,
          )?.id ?? '',
        position: 8,
        isVisible: false,
        size: 200,
      },
      // Denial Reason (why was it denied)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.denialReason,
          )?.id ?? '',
        position: 9,
        isVisible: false,
        size: 250,
      },
      // User Agent (client information)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.userAgent,
          )?.id ?? '',
        position: 10,
        isVisible: false,
        size: 200,
      },
      // Request Context (JSON details)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.requestContext,
          )?.id ?? '',
        position: 11,
        isVisible: false,
        size: 200,
      },
      // User ID
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.userId,
          )?.id ?? '',
        position: 12,
        isVisible: false,
        size: 150,
      },
    ],
  };
};

export const mktPermissionAuditsDeniedView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktPermissionAudit,
  );

  if (!itemObjectMetadata) {
    throw new Error('Permission Audit object metadata not found');
  }

  return {
    name: 'Denied Permissions',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'DENIED',
    position: 24,
    icon: 'IconShieldX',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.checkResult,
          )?.id ?? '',
        operand: 'IS',
        value: 'denied',
        displayValue: 'Denied',
      },
    ],
    fields: [
      // Created At (when the denial occurred)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      // Workspace Member (who was denied)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.workspaceMember,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      // Action (what was denied)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.action,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 100,
      },
      // Object Name (what they tried to access)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.objectName,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 140,
      },
      // Denial Reason (why was it denied - VISIBLE for security review)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.denialReason,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 300,
      },
      // IP Address (security monitoring)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.ipAddress,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 140,
      },
      // Permission Source (what type of permission was checked)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.permissionSource,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 130,
      },
      // Record ID (what specific record)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.recordId,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 180,
      },
      // User Agent (detect suspicious tools)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.userAgent,
          )?.id ?? '',
        position: 8,
        isVisible: true,
        size: 200,
      },
      // Request Context (security analysis)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.requestContext,
          )?.id ?? '',
        position: 9,
        isVisible: false,
        size: 200,
      },
    ],
  };
};

export const mktPermissionAuditsPerformanceView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktPermissionAudit,
  );

  if (!itemObjectMetadata) {
    throw new Error('Permission Audit object metadata not found');
  }

  return {
    name: 'Slow Permission Checks',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'PERFORMANCE',
    position: 25,
    icon: 'IconClock',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.checkDurationMs,
          )?.id ?? '',
        operand: 'GREATER_THAN',
        value: '100',
        displayValue: 'Duration > 100ms',
      },
    ],
    fields: [
      // Check Duration (primary performance metric)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.checkDurationMs,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 120,
      },
      // Created At (when did the slow check occur)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      // Action (what type of operation was slow)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.action,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 100,
      },
      // Object Name (which object type is slow)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.objectName,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 140,
      },
      // Permission Source (which type of check is slow)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.permissionSource,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
      },
      // Workspace Member (who experienced the slow check)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.workspaceMember,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
      // Check Result (did the slow check succeed)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.checkResult,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 100,
      },
      // Request Context (performance analysis details - VISIBLE)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.requestContext,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 250,
      },
      // Record ID (specific record causing slowness)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.recordId,
          )?.id ?? '',
        position: 8,
        isVisible: false,
        size: 180,
      },
    ],
  };
};

export const mktPermissionAuditsSecurityView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktPermissionAudit,
  );

  if (!itemObjectMetadata) {
    throw new Error('Permission Audit object metadata not found');
  }

  return {
    name: 'Security Monitoring',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'SECURITY',
    position: 26,
    icon: 'IconShieldLock',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.action,
          )?.id ?? '',
        operand: 'IS',
        value: 'delete',
        displayValue: 'Delete Actions',
      },
    ],
    fields: [
      // Created At (when security event occurred)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      // IP Address (source of request - critical for security)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.ipAddress,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 140,
      },
      // Workspace Member (who attempted action)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.workspaceMember,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      // Action (security-sensitive actions)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.action,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 100,
      },
      // Object Name (what was targeted)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.objectName,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 140,
      },
      // Check Result (granted/denied - security outcome)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.checkResult,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 100,
      },
      // User Agent (detect suspicious tools/scripts)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.userAgent,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 200,
      },
      // Record ID (what specific record was targeted)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.recordId,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 180,
      },
      // Denial Reason (security policy violation details)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_PERMISSION_AUDIT_FIELD_IDS.denialReason,
          )?.id ?? '',
        position: 8,
        isVisible: true,
        size: 250,
      },
      // Request Context (security analysis context)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_PERMISSION_AUDIT_FIELD_IDS.requestContext,
          )?.id ?? '',
        position: 9,
        isVisible: true,
        size: 200,
      },
    ],
  };
};
