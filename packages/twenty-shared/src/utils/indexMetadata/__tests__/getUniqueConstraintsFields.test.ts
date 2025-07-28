import { FieldMetadataType } from '@/types';
import { getUniqueConstraintsFields } from '@/utils/indexMetadata/getUniqueConstraintsFields';

describe('getUniqueConstraintsFields', () => {
  const mockIdField = {
    id: 'field-id-1',
    name: 'id',
    label: 'ID',
    type: FieldMetadataType.UUID,
    objectMetadataId: 'object-id-1',
    isNullable: false,
    isUnique: false,
    isCustom: false,
    isSystem: true,
    isActive: true,
    isLabelSyncedWithName: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockEmailField = {
    id: 'field-id-2',
    name: 'email',
    label: 'Email',
    type: FieldMetadataType.EMAILS,
    objectMetadataId: 'object-id-1',
    isNullable: true,
    isUnique: true,
    isCustom: false,
    isSystem: false,
    isActive: true,
    isLabelSyncedWithName: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockNameField = {
    id: 'field-id-3',
    name: 'name',
    label: 'Name',
    type: FieldMetadataType.TEXT,
    objectMetadataId: 'object-id-1',
    isNullable: true,
    isUnique: false,
    isCustom: false,
    isSystem: false,
    isActive: true,
    isLabelSyncedWithName: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const createMockIndexFieldMetadata = (
    fieldMetadataId: string,
    indexMetadataId: string,
    order = 0,
  ) => ({
    id: `index-field-${fieldMetadataId}-${indexMetadataId}`,
    indexMetadataId,
    fieldMetadataId,
    order,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

  const createMockIndexMetadata = (
    id: string,
    name: string,
    isUnique: boolean,
    indexFieldMetadatas: any,
  ) => ({
    id,
    name,
    isUnique,
    indexFieldMetadatas,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    indexWhereClause: null,
  });

  const createMockObjectMetadata = (fields: any, indexMetadatas: any) => ({
    id: 'object-id-1',
    workspaceId: 'workspace-id-1',
    nameSingular: 'person',
    namePlural: 'people',
    labelSingular: 'Person',
    labelPlural: 'People',
    description: 'A person object',
    icon: 'IconUser',
    targetTableName: 'person',
    fields,
    indexMetadatas,
    isSystem: false,
    isCustom: false,
    isActive: true,
    isRemote: false,
    isAuditLogged: true,
    isSearchable: true,
  });

  it('should return the primary key constraint field if no unique indexes are present', () => {
    const objectMetadata = createMockObjectMetadata(
      [mockIdField, mockNameField],
      [],
    );

    const result = getUniqueConstraintsFields(objectMetadata);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0]).toEqual(mockIdField);
  });

  it('should return the primary key constraint field and the unique indexes fields if unique indexes are present', () => {
    const emailIndexFieldMetadata = createMockIndexFieldMetadata(
      'field-id-2',
      'index-id-1',
    );
    const emailIndex = createMockIndexMetadata(
      'index-id-1',
      'unique_email_index',
      true,
      [emailIndexFieldMetadata],
    );

    const objectMetadata = createMockObjectMetadata(
      [mockIdField, mockEmailField, mockNameField],
      [emailIndex],
    );

    const result = getUniqueConstraintsFields(objectMetadata);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0]).toEqual(mockIdField);
    expect(result[1]).toHaveLength(1);
    expect(result[1][0]).toEqual(mockEmailField);
  });
});
