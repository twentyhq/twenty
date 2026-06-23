import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { sanitizeRawUpdateFieldInput } from 'src/engine/metadata-modules/flat-field-metadata/utils/sanitize-raw-update-field-input';

const getSystemFieldMock = () =>
  getFlatFieldMetadataMock({
    universalIdentifier: 'created-at-uid',
    objectMetadataId: 'obj-1',
    type: FieldMetadataType.DATE_TIME,
    name: 'createdAt',
    isSystem: true,
    isActive: true,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

const buildInput = (
  existingId: string,
  workspaceId: string,
  overrides: Partial<UpdateFieldInput>,
): UpdateFieldInput => ({
  id: existingId,
  workspaceId,
  ...overrides,
});

describe('sanitizeRawUpdateFieldInput', () => {
  it('should throw FIELD_MUTATION_NOT_ALLOWED when deactivating a system field', () => {
    const existingFlatFieldMetadata = getSystemFieldMock();

    expect(() =>
      sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata,
        rawUpdateFieldInput: buildInput(
          existingFlatFieldMetadata.id,
          existingFlatFieldMetadata.workspaceId,
          { isActive: false },
        ),
        isSystemBuild: false,
      }),
    ).toThrow(
      expect.objectContaining({
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
      }),
    );
  });

  it('should allow reactivating a system field', () => {
    const existingFlatFieldMetadata = getSystemFieldMock();

    expect(() =>
      sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata,
        rawUpdateFieldInput: buildInput(
          existingFlatFieldMetadata.id,
          existingFlatFieldMetadata.workspaceId,
          { isActive: true },
        ),
        isSystemBuild: false,
      }),
    ).not.toThrow();
  });

  it('should allow deactivating a system field during a system build', () => {
    const existingFlatFieldMetadata = getSystemFieldMock();

    expect(() =>
      sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata,
        rawUpdateFieldInput: buildInput(
          existingFlatFieldMetadata.id,
          existingFlatFieldMetadata.workspaceId,
          { isActive: false },
        ),
        isSystemBuild: true,
      }),
    ).not.toThrow();
  });

  it('should allow deactivating a non-system field', () => {
    const existingFlatFieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: 'job-title-uid',
      objectMetadataId: 'obj-1',
      type: FieldMetadataType.TEXT,
      name: 'jobTitle',
      isSystem: false,
      isActive: true,
    });

    expect(() =>
      sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata,
        rawUpdateFieldInput: buildInput(
          existingFlatFieldMetadata.id,
          existingFlatFieldMetadata.workspaceId,
          { isActive: false },
        ),
        isSystemBuild: false,
      }),
    ).not.toThrow();
  });
});
