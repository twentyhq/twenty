import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import { IndexFieldMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-field-metadata.interface';
import { IndexMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-metadata.interface';

import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { getUniqueConstraintsFields } from 'src/engine/metadata-modules/index-metadata/utils/getUniqueConstraintsFields.util';

describe('getUniqueConstraintsFields', () => {
  const mockIdField: FieldMetadataInterface = {
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

  const mockEmailField: FieldMetadataInterface = {
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

  const mockNameField: FieldMetadataInterface = {
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
  ): IndexFieldMetadataInterface =>
    ({
      id: `index-field-${fieldMetadataId}-${indexMetadataId}`,
      indexMetadataId,
      fieldMetadataId,
      order,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }) as IndexFieldMetadataInterface;

  const createMockIndexMetadata = (
    id: string,
    name: string,
    isUnique: boolean,
    indexFieldMetadatas: IndexFieldMetadataInterface[],
  ): IndexMetadataInterface => ({
    id,
    name,
    isUnique,
    indexFieldMetadatas,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    indexWhereClause: null,
    indexType: IndexType.BTREE,
  });

  const createMockObjectMetadata = (
    fields: FieldMetadataInterface[],
    indexMetadatas: IndexMetadataInterface[] = [],
  ): ObjectMetadataInterface => ({
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
    const objectMetadata = createMockObjectMetadata([
      mockIdField,
      mockNameField,
    ]);

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
