import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { MKT_DEPARTMENT_HIERARCHY_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktDepartmentHierarchiesAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktDepartmentHierarchy,
  );

  if (!itemObjectMetadata) {
    throw new Error('Department hierarchy object metadata not found');
  }

  return {
    name: 'All Department Hierarchies',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 17,
    icon: 'IconHierarchy',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.parentDepartment,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.childDepartment,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.relationshipType,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.hierarchyLevel,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.validFrom,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.validTo,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.inheritsPermissions,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 130,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.canEscalateToParent,
          )?.id ?? '',
        position: 7,
        isVisible: false,
        size: 140,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.allowsCrossBranchAccess,
          )?.id ?? '',
        position: 8,
        isVisible: false,
        size: 150,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.displayOrder,
          )?.id ?? '',
        position: 9,
        isVisible: false,
        size: 100,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.notes,
          )?.id ?? '',
        position: 10,
        isVisible: false,
        size: 200,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.isActive,
          )?.id ?? '',
        position: 11,
        isVisible: true,
        size: 80,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 12,
        isVisible: false,
        size: 150,
      },
    ],
  };
};

export const mktActiveHierarchiesView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktDepartmentHierarchy,
  );

  if (!itemObjectMetadata) {
    throw new Error('Department hierarchy object metadata not found');
  }

  return {
    name: 'Active Hierarchies',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'ACTIVE',
    position: 18,
    icon: 'IconCheck',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.isActive,
          )?.id ?? '',
        operand: 'IS',
        value: true,
        displayValue: 'Active',
      },
    ],
    fields: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.parentDepartment,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.childDepartment,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.relationshipType,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.hierarchyLevel,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.inheritsPermissions,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 130,
      },
    ],
  };
};

export const mktParentChildHierarchiesView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktDepartmentHierarchy,
  );

  if (!itemObjectMetadata) {
    throw new Error('Department hierarchy object metadata not found');
  }

  return {
    name: 'Parent-Child Hierarchies',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'PARENT_CHILD',
    position: 19,
    icon: 'IconGitBranch',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.relationshipType,
          )?.id ?? '',
        operand: 'IS',
        value: 'PARENT_CHILD',
        displayValue: 'Parent-Child',
      },
    ],
    fields: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.parentDepartment,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.childDepartment,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.hierarchyLevel,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.inheritsPermissions,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 130,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.canEscalateToParent,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 140,
      },
    ],
  };
};

export const mktMatrixHierarchiesView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktDepartmentHierarchy,
  );

  if (!itemObjectMetadata) {
    throw new Error('Department hierarchy object metadata not found');
  }

  return {
    name: 'Matrix Hierarchies',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'MATRIX',
    position: 20,
    icon: 'IconGrid3x3',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.relationshipType,
          )?.id ?? '',
        operand: 'IS',
        value: 'MATRIX',
        displayValue: 'Matrix',
      },
    ],
    fields: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.parentDepartment,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.childDepartment,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.allowsCrossBranchAccess,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.notes,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 250,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_DEPARTMENT_HIERARCHY_FIELD_IDS.isActive,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 80,
      },
    ],
  };
};
