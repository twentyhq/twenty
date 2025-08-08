import { FieldMetadataType } from 'twenty-shared/types';

import { computeUniqueIndexWhereClause } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-index-where-clause.util';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

describe('computeUniqueIndexWhereClause', () => {
  it('should return undefined if standard default value is not defined', () => {
    const fieldMetadata = getMockFieldMetadataEntity({
      workspaceId: 'workspace-id',
      objectMetadataId: 'object-id',
      type: FieldMetadataType.UUID,
      name: 'testField',
    });

    const result = computeUniqueIndexWhereClause(fieldMetadata);

    expect(result).toBeUndefined();
  });

  it('should return a where clause for a an atomic type field', () => {
    const fieldMetadata = getMockFieldMetadataEntity({
      workspaceId: 'workspace-id',
      objectMetadataId: 'object-id',
      type: FieldMetadataType.TEXT,
      name: 'testTextField',
    });

    const result = computeUniqueIndexWhereClause(fieldMetadata);

    expect(result).toBe('"testTextField" != \'\'');
  });

  it('should return a where clause for a composite type field', () => {
    const fieldMetadata = getMockFieldMetadataEntity({
      workspaceId: 'workspace-id',
      objectMetadataId: 'object-id',
      type: FieldMetadataType.EMAILS,
      name: 'testEmailsField',
    });

    const result = computeUniqueIndexWhereClause(fieldMetadata);

    expect(result).toBe('"testEmailsFieldPrimaryEmail" != \'\'');
  });
});
