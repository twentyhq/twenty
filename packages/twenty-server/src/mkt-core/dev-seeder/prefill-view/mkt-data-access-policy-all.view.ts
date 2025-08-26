import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { MKT_DATA_ACCESS_POLICY_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktDataAccessPoliciesAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktDataAccessPolicy,
  );

  if (!itemObjectMetadata) {
    throw new Error('Data Access Policy object metadata not found');
  }

  return {
    name: 'All Data Access Policies',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 19,
    icon: 'IconShield',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      // Name
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 200,
      },
      // Department
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.department,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      // Specific Member
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DATA_ACCESS_POLICY_FIELD_IDS.specificMember,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      // Object Name
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.objectName,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 140,
      },
      // Priority
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.priority,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 80,
      },
      // Is Active
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.isActive,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 80,
      },
      // Description
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.description,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 250,
      },
      // Filter Conditions (JSON)
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DATA_ACCESS_POLICY_FIELD_IDS.filterConditions,
          )?.id ?? '',
        position: 7,
        isVisible: false, // Hidden by default due to complexity
        size: 200,
      },
      // Created At
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 8,
        isVisible: true,
        size: 150,
      },
      // Updated At
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
          )?.id ?? '',
        position: 9,
        isVisible: false,
        size: 150,
      },
    ],
  };
};

export const mktDataAccessPoliciesActiveView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktDataAccessPolicy,
  );

  if (!itemObjectMetadata) {
    throw new Error('Data Access Policy object metadata not found');
  }

  return {
    name: 'Active Data Access Policies',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'ACTIVE',
    position: 20,
    icon: 'IconShieldCheck',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.isActive,
          )?.id ?? '',
        operand: 'IS',
        value: 'true',
        displayValue: 'Active',
      },
    ],
    fields: [
      // Name
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 220,
      },
      // Department
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.department,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 140,
      },
      // Object Name
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.objectName,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      // Priority
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.priority,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 80,
      },
      // Description
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.description,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 300,
      },
      // Created At
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
    ],
  };
};

export const mktDataAccessPoliciesDepartmentView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktDataAccessPolicy,
  );

  if (!itemObjectMetadata) {
    throw new Error('Data Access Policy object metadata not found');
  }

  return {
    name: 'Department Policies',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'DEPARTMENT',
    position: 21,
    icon: 'IconBuildingBank',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.department,
          )?.id ?? '',
        operand: 'IS_NOT_EMPTY',
        value: '',
        displayValue: 'Has Department',
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.isActive,
          )?.id ?? '',
        operand: 'IS',
        value: 'true',
        displayValue: 'Active',
      },
    ],
    fields: [
      // Name
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 200,
      },
      // Department
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.department,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 160,
      },
      // Object Name
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.objectName,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      // Priority
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.priority,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 80,
      },
      // Description
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.description,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 300,
      },
    ],
  };
};

export const mktDataAccessPoliciesMemberView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktDataAccessPolicy,
  );

  if (!itemObjectMetadata) {
    throw new Error('Data Access Policy object metadata not found');
  }

  return {
    name: 'Member Specific Policies',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'MEMBER_SPECIFIC',
    position: 22,
    icon: 'IconUser',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DATA_ACCESS_POLICY_FIELD_IDS.specificMember,
          )?.id ?? '',
        operand: 'IS_NOT_EMPTY',
        value: '',
        displayValue: 'Has Specific Member',
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.isActive,
          )?.id ?? '',
        operand: 'IS',
        value: 'true',
        displayValue: 'Active',
      },
    ],
    fields: [
      // Name
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 200,
      },
      // Specific Member
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DATA_ACCESS_POLICY_FIELD_IDS.specificMember,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 180,
      },
      // Object Name
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.objectName,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      // Priority
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.priority,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 80,
      },
      // Description
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DATA_ACCESS_POLICY_FIELD_IDS.description,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 300,
      },
      // Filter Conditions (JSON) - Visible for member-specific policies
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DATA_ACCESS_POLICY_FIELD_IDS.filterConditions,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 200,
      },
    ],
  };
};
